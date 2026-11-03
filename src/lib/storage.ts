import { MAX_UPLOAD_BYTES } from "./constants";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");

/** Returns an error message in Mongolian, or null if the file is OK. */
export function checkImageFile(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Зөвхөн JPG, PNG, WEBP зураг оруулна уу.";
  if (file.size > 15 * 1024 * 1024) return "Зургийн хэмжээ 15MB-аас ихгүй байна.";
  return null;
}

/**
 * Shrinks a photo in the browser before upload (max 1600px, WebP).
 * Phone photos are often 5–10MB; this keeps Supabase's free 1GB storage
 * from filling up and makes pages load faster.
 */
export async function compressImage(file: File, maxSize = 1600): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85),
    );
    if (blob && blob.size <= MAX_UPLOAD_BYTES) return blob;
  } catch {
    // Fall through and upload the original file.
  }
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Зургийн хэмжээ хэт том байна (5MB хүртэл).");
  return file;
}

/**
 * Extracts "<user_id>/<file>" from a Supabase public URL so the file can be
 * deleted. Returns null for URLs from other hosts (e.g. demo images).
 */
export function storagePathFromUrl(url: string, bucket: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length).split("?")[0]!);
}
