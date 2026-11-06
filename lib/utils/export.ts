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
 * Exports an SVG element to a PNG file.
 * 
 * @param svgId - The ID of the SVG element to export
 * @param fileName - The desired file name
 * @param customWidth - Optional export width (defaults to viewBox width or 1280)
 * @param customHeight - Optional export height (defaults to viewBox height or 720)
 */
export async function exportToPng(
  svgId: string, 
  fileName: string,
  customWidth?: number,
  customHeight?: number
) {
  const svgElement = document.getElementById(svgId) as SVGSVGElement | null;
  if (!svgElement) return;

  // 1. Clone the SVG to manipulate it without affecting the UI
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  
  // 2. Convert all <image> tags to Data URLs to bypass CORS in Canvas
  const images = clonedSvg.querySelectorAll('image');
  for (const img of Array.from(images)) {
    const href = img.getAttribute('href');
    if (href && href.startsWith('http')) {
      try {
        const dataUrl = await toDataURL(href);
        img.setAttribute('href', dataUrl);
      } catch (err) {
        console.error('Failed to convert image to DataURL:', href, err);
      }
    }
  }

  // 3. Determine resolution from parameters or SVG viewBox
  let width = customWidth;
  let height = customHeight;
  if (!width || !height) {
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4) {
        width = width || parts[2];
        height = height || parts[3];
      }
    }
  }
  width = width || 1280;
  height = height || 720;

  // Ensure clone has explicit width/height matching the resolution for crisp canvas rendering
  clonedSvg.setAttribute('width', String(width));
  clonedSvg.setAttribute('height', String(height));

  // 4. Serialize SVG to XML
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  // 5. Create a Canvas to render the SVG
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  canvas.width = width;
  canvas.height = height;

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        // 6. Trigger download
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${fileName}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(url);
        resolve();
      }
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}
