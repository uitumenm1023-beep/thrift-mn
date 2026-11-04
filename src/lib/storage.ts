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
export async function compressImage(file: File, maxSize = 1600, quality = 0.85): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d")!;
    const encode = (type: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let blob = await encode("image/webp");
    // Some browsers (older Safari) can't encode WebP and silently return PNG:
    // use JPEG instead, on white so transparent areas don't turn black.
    if (!blob || blob.type !== "image/webp") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      blob = await encode("image/jpeg");
    }
    bitmap.close();
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

// Uploads are saved as "<id>.full.<ext>" plus a small "<id>.thumb.<ext>"
// (ext = webp, or jpg where the browser can't make WebP) for cards and
// lists. Older uploads have no thumbnail and keep a single file.
const FULL_RE = /\.full\.(webp|jpg)(?=$|\?)/;
const PREPARED_RE = /\.(full|thumb)\.(webp|jpg)(?=$|\?)/;

/** Thumbnail URL for an upload that has one, otherwise null. */
export function thumbUrl(url: string) {
  return FULL_RE.test(url) ? url.replace(FULL_RE, ".thumb.$1") : null;
}

/** True for uploads saved with the full/thumb naming (served without resizing). */
export function isPreparedUpload(url: string) {
  return PREPARED_RE.test(url);
}

/** Adds each upload's thumbnail path so both files are deleted together. */
export function withThumbPaths(paths: string[]) {
  return paths.flatMap((p) => (FULL_RE.test(p) ? [p, p.replace(FULL_RE, ".thumb.$1")] : [p]));
}
