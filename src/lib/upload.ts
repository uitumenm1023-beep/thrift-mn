import { compressImage } from "./storage";
import { createClient } from "./supabase/client";

/** Uploads an image to <bucket>/<userId>/... and returns its public URL. */
export async function uploadImage(bucket: string, userId: string, file: File) {
  const supabase = createClient();
  const body = await compressImage(file);
  const ext = body.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg");
  const path = `${userId}/${crypto.randomUUID()}.${ext.toLowerCase()}`;

  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType: body.type || file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Зураг хуулахад алдаа гарлаа: ${error.message}`);

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
