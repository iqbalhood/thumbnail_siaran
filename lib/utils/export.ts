/**
 * Fetches an external image through our same-origin proxy route and returns
 * a Base64 Data URL. Because the fetch is same-origin (localhost → localhost),
 * the browser canvas is never "tainted" regardless of what CORS headers the
 * original storage server sends.
 */
async function toDataURL(externalUrl: string): Promise<string> {
  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(externalUrl)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`proxy fetch failed: ${res.status}`);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Exports the SVG element identified by `svgId` as a 1280×720 PNG file.
 */
export async function exportToPng(svgId: string, fileName: string) {
  const svgElement = document.getElementById(svgId) as SVGSVGElement | null;
  if (!svgElement) throw new Error(`SVG element #${svgId} not found`);

  // 1. Clone so we don't mutate the live DOM
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

  // 2. Replace every external <image> href with a data URL via our proxy.
  //    We check both href and xlink:href (namespaced) to cover all browsers.
  const XLINK = 'http://www.w3.org/1999/xlink';
  const imageEls = Array.from(clonedSvg.querySelectorAll('image'));

  await Promise.all(
    imageEls.map(async (el) => {
      const href =
        el.getAttribute('href') ||
        el.getAttributeNS(XLINK, 'href') ||
        null;

      if (!href || !href.startsWith('http')) return;

      try {
        const dataUrl = await toDataURL(href);
        el.setAttribute('href', dataUrl);
        el.removeAttributeNS(XLINK, 'href'); // remove xlink:href if present
      } catch (err) {
        // If proxy also fails, remove the external URL entirely so canvas
        // is never tainted. The image will simply not appear.
        console.error('[export] failed to proxy image:', href, err);
        el.removeAttribute('href');
        el.removeAttributeNS(XLINK, 'href');
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
