/**
 * Converts a URL to a Base64 Data URL to avoid Canvas "tainted" security issues.
 */
async function toDataURL(url: string): Promise<string> {
  let blob: Blob;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response not ok');
    blob = await response.blob();
  } catch (error) {
    console.warn(`Direct fetch failed for ${url}, trying proxy...`, error);
    // Use Next.js API proxy to bypass CORS restrictions
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Proxy fetch failed');
    blob = await response.blob();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Exports an SVG element to a high-resolution PNG file.
 * 
 * @param svgId - The ID of the SVG element to export
 * @param fileName - The desired file name
 * @param customWidth - Optional base export width (defaults to viewBox width or 1280)
 * @param customHeight - Optional base export height (defaults to viewBox height or 720)
 * @param scale - Resolution multiplier for HD/2K crispness (defaults to 2)
 */
export async function exportToPng(
  svgId: string, 
  fileName: string,
  customWidth?: number,
  customHeight?: number,
  scale: number = 2
) {
  const svgElement = document.getElementById(svgId) as SVGSVGElement | null;
  if (!svgElement) return;

  // 1. Clone the SVG to manipulate it without affecting the UI
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  
  // 2. Convert all <image> tags (http, https, or relative paths) to Data URLs to bypass CORS & Blob origin limits
  const images = clonedSvg.querySelectorAll('image');
  await Promise.all(
    Array.from(images).map(async (img) => {
      img.setAttribute('image-rendering', 'optimizeQuality');
      const rawHref =
        img.getAttribute('href') ||
        img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
      if (!rawHref || rawHref.startsWith('data:')) return;

      try {
        const absoluteUrl = rawHref.startsWith('http')
          ? rawHref
          : new URL(rawHref, window.location.origin).href;
        const dataUrl = await toDataURL(absoluteUrl);
        img.setAttribute('href', dataUrl);
        img.removeAttributeNS('http://www.w3.org/1999/xlink', 'href');
      } catch (err) {
        console.error('Failed to convert image to DataURL:', rawHref, err);
      }
    })
  );

  // 3. Determine base resolution from parameters or SVG viewBox
  let baseWidth = customWidth;
  let baseHeight = customHeight;
  if (!baseWidth || !baseHeight) {
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4) {
        baseWidth = baseWidth || parts[2];
        baseHeight = baseHeight || parts[3];
      }
    }
  }
  baseWidth = baseWidth || 1280;
  baseHeight = baseHeight || 720;

  const exportWidth = Math.round(baseWidth * scale);
  const exportHeight = Math.round(baseHeight * scale);

  // Ensure clone has explicit namespaces, high-precision rendering hints, and scaled dimensions
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  clonedSvg.setAttribute('width', String(exportWidth));
  clonedSvg.setAttribute('height', String(exportHeight));
  clonedSvg.setAttribute('shape-rendering', 'geometricPrecision');
  clonedSvg.setAttribute('text-rendering', 'geometricPrecision');
  clonedSvg.setAttribute('image-rendering', 'optimizeQuality');

  // 4. Serialize SVG to XML
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  // 5. Create a high-DPI Canvas to render the SVG
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image(exportWidth, exportHeight);

  canvas.width = exportWidth;
  canvas.height = exportHeight;

  return new Promise<void>((resolve, reject) => {
    img.onload = async () => {
      try {
        if (typeof img.decode === 'function') {
          await img.decode().catch(() => {});
        }
        if (!ctx) {
          throw new Error('Canvas 2D context unavailable');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, exportWidth, exportHeight);

        // 6. Trigger download via Blob (more reliable than dataURL for large HD images on mobile & desktop)
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(svgUrl);
            if (!blob) {
              reject(new Error('Gagal membuat file gambar PNG'));
              return;
            }
            const blobUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = `${fileName}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
            resolve();
          },
          'image/png',
          1.0
        );
      } catch (err) {
        URL.revokeObjectURL(svgUrl);
        reject(err);
      }
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(svgUrl);
      reject(err);
    };
    img.src = svgUrl;
  });
}
