"use server";

import { updateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { CATALOG_TAG } from "@/lib/data/catalog";
import { storagePathFromUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, ShopStatus } from "@/lib/types";
import { isUuid, str } from "@/lib/validation";

// Admin-only actions. The role check here is repeated by RLS (is_admin())
// in the database, so a forged request without the admin role fails twice.

const DENIED: ActionResult = { ok: false, error: "Зөвхөн админ энэ үйлдлийг хийнэ." };

async function isAdmin() {
  const user = await getCurrentUser();
  return user?.profile.role === "admin";
}

const STATUSES: ShopStatus[] = ["pending", "approved", "rejected", "suspended"];

export async function setShopStatus(shopId: string, status: ShopStatus): Promise<ActionResult> {
  if (!(await isAdmin())) return DENIED;
  if (!isUuid(shopId) || !STATUSES.includes(status)) return { ok: false, error: "Буруу хүсэлт." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("shops").update({ status }).eq("id", shopId).select("id");
  if (error || !data?.length) return { ok: false, error: "Төлөв өөрчлөхөд алдаа гарлаа." };
  updateTag(CATALOG_TAG);
  return { ok: true };
}

export async function adminDeleteProduct(productId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return DENIED;
  if (!isUuid(productId)) return { ok: false, error: "Буруу хүсэлт." };
  const supabase = await createClient();
  const { data: images } = await supabase.from("product_images").select("image_url").eq("product_id", productId);
  const { data, error } = await supabase.from("products").delete().eq("id", productId).select("id");
  if (error || !data?.length) return { ok: false, error: "Устгахад алдаа гарлаа." };
  const paths = (images ?? [])
    .map((i) => storagePathFromUrl(i.image_url as string, STORAGE_BUCKETS.products))
    .filter((p): p is string => Boolean(p));
  if (paths.length) await supabase.storage.from(STORAGE_BUCKETS.products).remove(paths);
  updateTag(CATALOG_TAG);
  return { ok: true };
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Category images are shown with next/image, so only allowed hosts work. */
function isAllowedImageUrl(url: string) {
  if (/^\/demo\/[\w/-]+\.(webp|png|jpg)$/.test(url)) return true; // bundled demo images
  try {
    const u = new URL(url);
    return u.protocol === "https:" && (u.hostname.endsWith(".supabase.co") || u.hostname === "images.unsplash.com");
  } catch {
    return false;
  }
}

export async function saveCategory(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await isAdmin())) return DENIED;
  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  const slug = str(formData.get("slug")).toLowerCase();
  const imageUrl = str(formData.get("image_url"));
  const sortOrder = Number(str(formData.get("sort_order")) || "0");

  const fieldErrors: Record<string, string> = {};
  if (id && !isUuid(id)) return { ok: false, error: "Буруу хүсэлт." };
  if (name.length < 2 || name.length > 60) fieldErrors.name = "Нэр 2–60 тэмдэгт.";
  if (!SLUG_RE.test(slug) || slug.length > 60) fieldErrors.slug = "Зөвхөн латин жижиг үсэг, тоо, зураас (жишээ: outerwear).";
  if (imageUrl && !isAllowedImageUrl(imageUrl)) fieldErrors.image_url = "Supabase Storage, images.unsplash.com эсвэл /demo/... зураг байна.";
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999) fieldErrors.sort_order = "0–999 бүхэл тоо.";
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Талбаруудаа шалгана уу.", fieldErrors };

  const supabase = await createClient();
  const row = { name, slug, image_url: imageUrl || null, sort_order: sortOrder };
  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert(row);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ийм slug-тай ангилал байна.", fieldErrors: { slug: "Давхардсан slug." } };
    return { ok: false, error: "Хадгалахад алдаа гарлаа." };
  }
  updateTag(CATALOG_TAG);
  return { ok: true, message: id ? "Ангилал шинэчлэгдлээ." : "Ангилал нэмэгдлээ." };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return DENIED;
  if (!isUuid(id)) return { ok: false, error: "Буруу хүсэлт." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").delete().eq("id", id).select("id");
  if (error || !data?.length) return { ok: false, error: "Устгахад алдаа гарлаа." };
  updateTag(CATALOG_TAG);
  return { ok: true };
}
