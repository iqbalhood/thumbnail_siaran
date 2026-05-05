/**
 * Converts a URL to a Base64 Data URL to avoid Canvas "tainted" security issues.
 */
async function toDataURL(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
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
 */
export async function exportToPng(svgId: string, fileName: string) {
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

  // 3. Serialize SVG to XML
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  // 4. Create a Canvas to render the SVG
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  canvas.width = 1280;
  canvas.height = 720;

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1280, 720);
        
        // 5. Trigger download
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
