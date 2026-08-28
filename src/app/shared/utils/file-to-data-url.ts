/**
 * Read a local image and return a compressed JPEG data-URL.
 * EngineerProfile.imageUrl / Merchant.iconUrl are capped at 500 chars by the API.
 */
export async function fileToDataUrl(
  file: File,
  maxDataUrlLength = 490
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  const bitmap = await loadImage(file);

  let maxSize = 96;
  let quality = 0.55;

  for (let attempt = 0; attempt < 12; attempt++) {
    const dataUrl = drawToJpegDataUrl(bitmap, maxSize, quality);
    if (dataUrl.length <= maxDataUrlLength) {
      return dataUrl;
    }

    if (quality > 0.25) {
      quality = Math.max(0.2, quality - 0.1);
    } else {
      maxSize = Math.max(24, Math.floor(maxSize * 0.75));
      quality = 0.45;
    }
  }

  const lastTry = drawToJpegDataUrl(bitmap, 24, 0.2);
  if (lastTry.length <= maxDataUrlLength) {
    return lastTry;
  }

  throw new Error(
    `Image is too large for the API (max ${maxDataUrlLength} characters). Try a smaller photo.`
  );
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

function drawToJpegDataUrl(
  img: HTMLImageElement,
  maxSize: number,
  quality: number
): string {
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}
