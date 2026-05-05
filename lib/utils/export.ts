// Transparent 1×1 GIF — used as placeholder when an image cannot be converted,
// so the canvas does NOT get tainted by a lingering external URL.
const TRANSPARENT_PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Converts an external URL to a Base64 Data URL.
 *
 * Strategy (two-pass):
 *  1. fetch() with CORS mode — works when the storage bucket sends CORS headers.
 *  2. If fetch fails, draw the image onto a temp canvas via HTMLImageElement
 *     with crossOrigin = 'anonymous'.  Works when the server allows the origin
 *     but fetch is blocked by browser policy.
 *  3. If both fail, return a transparent placeholder so the main canvas is
 *     never tainted by a lingering http:// URL.
 */
async function toDataURL(url: string): Promise<string> {
  // --- Pass 1: fetch ---
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (fetchErr) {
    console.warn('[export] fetch failed, trying Image fallback:', url, fetchErr);
  }

  // --- Pass 2: HTMLImageElement + temp canvas ---
  try {
    return await new Promise<string>((resolve, reject) => {
      const tempImg = new Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.onload = () => {
        const c = document.createElement('canvas');
        c.width = tempImg.naturalWidth || 1;
        c.height = tempImg.naturalHeight || 1;
        const ctx = c.getContext('2d');
        if (!ctx) return reject(new Error('no 2d context'));
        ctx.drawImage(tempImg, 0, 0);
        try {
          resolve(c.toDataURL('image/png'));
        } catch (e) {
          reject(e);
        }
      };
      tempImg.onerror = () => reject(new Error('image load failed'));
      tempImg.src = url;
    });
  } catch (imgErr) {
    console.error('[export] Image fallback also failed, using placeholder:', url, imgErr);
    return TRANSPARENT_PLACEHOLDER;
  }
}

/**
 * Exports the SVG element identified by `svgId` as a 1280×720 PNG file.
 */
export async function exportToPng(svgId: string, fileName: string) {
  const svgElement = document.getElementById(svgId) as SVGSVGElement | null;
  if (!svgElement) throw new Error(`SVG element #${svgId} not found`);

  // 1. Clone so we don't mutate the live DOM
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

  // 2. Replace every external <image href> with a data URL (or placeholder)
  //    so the canvas is never tainted.
  const imageEls = Array.from(clonedSvg.querySelectorAll('image'));
  await Promise.all(
    imageEls.map(async (el) => {
      const href = el.getAttribute('href') ?? el.getAttribute('xlink:href');
      if (href && href.startsWith('http')) {
        const dataUrl = await toDataURL(href);
        el.setAttribute('href', dataUrl);
        el.removeAttribute('xlink:href'); // avoid duplicate references
      }
    })
  );

  // 3. Serialize SVG → Blob URL
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(svgBlob);

  // 4. Render onto canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1280, 720);
      URL.revokeObjectURL(blobUrl);
      resolve();
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error(`Failed to render SVG to canvas: ${err}`));
    };
    img.src = blobUrl;
  });

  // 5. Trigger PNG download
  const pngUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = pngUrl;
  link.download = `${fileName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
