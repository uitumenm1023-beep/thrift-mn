import { compressImage } from "./storage";
import { createClient } from "./supabase/client";

const UPLOAD_OPTIONS = { cacheControl: "31536000", upsert: false } as const;

/**
 * Uploads an image to <bucket>/<userId>/... and returns its public URL.
 * Saves a full version (max 1600px) and a small thumbnail (max 600px) for
 * cards and lists, both shrunk in the browser (WebP, or JPEG where WebP
 * isn't supported) so they can be served as-is.
 */
export async function uploadImage(bucket: string, userId: string, file: File) {
  const supabase = createClient();
  const storage = supabase.storage.from(bucket);
  const [full, thumb] = await Promise.all([compressImage(file), compressImage(file, 600, 0.8)]);
  const id = crypto.randomUUID();

  const ext = (b: Blob) => (b.type === "image/webp" ? "webp" : b.type === "image/jpeg" ? "jpg" : null);
  const fullExt = ext(full), thumbExt = ext(thumb);

  // Compression wasn't possible: keep the original as a single file.
  if (!fullExt || fullExt !== thumbExt) {
    const orig = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${userId}/${id}.${orig}`;
    const { error } = await storage.upload(path, full, { ...UPLOAD_OPTIONS, contentType: full.type || file.type });
    if (error) throw new Error(`Зураг хуулахад алдаа гарлаа: ${error.message}`);
    return storage.getPublicUrl(path).data.publicUrl;
  }

  const fullPath = `${userId}/${id}.full.${fullExt}`;
  const thumbPath = `${userId}/${id}.thumb.${fullExt}`;
  const results = await Promise.all([
    storage.upload(fullPath, full, { ...UPLOAD_OPTIONS, contentType: full.type }),
    storage.upload(thumbPath, thumb, { ...UPLOAD_OPTIONS, contentType: thumb.type }),
  ]);
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    await storage.remove([fullPath, thumbPath]);
    throw new Error(`Зураг хуулахад алдаа гарлаа: ${failed.error.message}`);
  }
  return storage.getPublicUrl(fullPath).data.publicUrl;
}
