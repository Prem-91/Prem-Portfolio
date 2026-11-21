// Shrinks photos in the browser before upload so they stay under Vercel's
// 4.5 MB request-body limit (the image is sent base64-encoded, +33%).
export type PreparedImage = { base64: string; contentType: string; filename: string };

const MAX_BASE64_CHARS = 4_000_000; // ~3 MB of raw bytes, safely under 4.5 MB

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image"));
    reader.readAsDataURL(blob);
  });
}

async function resizeToJpeg(file: File, maxDim: number, quality: number): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  const keepAsIs = file.type === "image/svg+xml" || file.type === "image/gif";
  let blob: Blob = file;
  let contentType = file.type || "image/jpeg";
  let filename = file.name;

  if (!keepAsIs) {
    // Try progressively smaller versions until it fits.
    for (const [maxDim, quality] of [
      [2400, 0.85],
      [2000, 0.8],
      [1600, 0.75],
      [1200, 0.7],
    ] as const) {
      try {
        const out = await resizeToJpeg(file, maxDim, quality);
        if (!out) break;
        blob = out;
        contentType = "image/jpeg";
        filename = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        if (Math.ceil(out.size * 1.34) <= MAX_BASE64_CHARS) break;
      } catch {
        break; // fall back to the original file
      }
    }
  }

  const base64 = await blobToBase64(blob);
  if (base64.length > MAX_BASE64_CHARS) {
    throw new Error("Image is still too large after compression. Please use a smaller image.");
  }
  return { base64, contentType, filename };
}
