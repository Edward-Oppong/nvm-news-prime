/**
 * imageUtils.ts
 * Client-side image utilities: resize, convert to WebP, detect portrait orientation.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

/** Returns the natural dimensions of an image File */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Returns true if image height > width (portrait orientation) */
export async function isPortraitImage(file: File): Promise<boolean> {
  const { width, height } = await getImageDimensions(file);
  return height > width;
}

/**
 * Resizes an image client-side using the Canvas API and converts it to WebP.
 * - Constrains to maxWidth × maxHeight (keeps aspect ratio)
 * - Quality: 0–1 (default 0.85)
 * - Returns a new File with .webp extension
 */
export async function resizeAndConvertToWebP(
  file: File,
  maxWidth = 2000,
  maxHeight = 1500,
  quality = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { naturalWidth: w, naturalHeight: h } = img;

      // Only resize if image is larger than max dimensions
      if (w > maxWidth || h > maxHeight) {
        const ratio = Math.min(maxWidth / w, maxHeight / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob returned null'));
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const resizedFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = objectUrl;
  });
}

/** Format bytes to a human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
