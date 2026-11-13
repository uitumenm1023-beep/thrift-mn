"use server";

import { updateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/data/catalog";
import { getCurrentUser, getOwnShop } from "@/lib/auth";
import { MAX_PRODUCT_IMAGES, STORAGE_BUCKETS } from "@/lib/constants";
import { storagePathFromUrl, withThumbPaths } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import { isUuid, str, validateProduct, validateShop } from "@/lib/validation";

// Every action re-checks who is calling. RLS and the guard triggers in the
// database enforce the same rules a second time.

async function ownerContext() {
  const user = await getCurrentUser();
  if (!user || user.profile.role !== "shop_owner") return null;
  const shop = await getOwnShop();
  return { user, shop };
}

const DENIED: ActionResult<never> = { ok: false, error: "Энэ үйлдлийг хийх эрх байхгүй байна. Дахин нэвтэрнэ үү." };

/** True when the URL points to a file this user uploaded into the bucket. */
function isOwnUpload(url: string, bucket: string, userId: string) {
  return storagePathFromUrl(url, bucket)?.startsWith(`${userId}/`) ?? false;
}

async function removeFiles(bucket: string, urls: (string | null | undefined)[]) {
  const paths = urls
    .filter((u): u is string => Boolean(u))
    .map((u) => storagePathFromUrl(u, bucket))
    .filter((p): p is string => Boolean(p));
  if (!paths.length) return;
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove(withThumbPaths(paths));
  if (error) console.error("[storage] remove failed:", error.message);
}

/** Turns the database's package-limit errors (0004_plans.sql) into a message. */
function planError(message: string | undefined): string | null {
  if (!message) return null;
  if (message.includes("PLAN_EXPIRED")) {
    return "Багцын хугацаа дууссан. Сунгах бол Instagram @ub_thriftmn руу DM бичээрэй.";
  }
  const m = message.match(/PLAN_LIMIT:(\d+)/);
  if (m) {
    return `Таны багцад ${m[1]} хүртэл бараа худалдаанд байна. Зарагдсан барааг тэмдэглэх эсвэл багцаа ахиулахаар Instagram @ub_thriftmn руу DM бичээрэй.`;
  }
  return null;
}

// ---------------------------------------------------------------- Shop

export async function saveShopProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ctx = await ownerContext();
  if (!ctx) return DENIED;

  const { errors, values } = validateShop({
    name: str(formData.get("name")),
    description: str(formData.get("description")),
    phone: str(formData.get("phone")),
    instagram_url: str(formData.get("instagram_url")),
    facebook_url: str(formData.get("facebook_url")),
    address: str(formData.get("address")),
    district: str(formData.get("district")),
  });
  if (Object.keys(errors).length) {
    return { ok: false, error: "Талбаруудаа шалгаад дахин оролдоно уу.", fieldErrors: errors };
  }

  const bucket = STORAGE_BUCKETS.shops;
  const images: { logo_url?: string | null; cover_url?: string | null } = {};
  for (const key of ["logo_url", "cover_url"] as const) {
    const raw = str(formData.get(key));
    const current = ctx.shop?.[key] ?? null;
    if (raw === (current ?? "")) continue;
    if (raw && !isOwnUpload(raw, bucket, ctx.user.id)) {
      return { ok: false, error: "Зургийн холбоос буруу байна. Зургаа дахин оруулна уу." };
    }
    images[key] = raw || null;
  }

  const supabase = await createClient();
  if (ctx.shop) {
    const { error } = await supabase.from("shops").update({ ...values, ...images }).eq("id", ctx.shop.id);
    if (error) {
      console.error("[saveShopProfile]", error.message);
      return { ok: false, error: "Хадгалахад алдаа гарлаа. Дахин оролдоно уу." };
    }
    // Delete replaced images from storage.
    await removeFiles(
      bucket,
      (["logo_url", "cover_url"] as const).filter((k) => k in images).map((k) => ctx.shop![k]),
    );
  } else {
    // Fallback: the shop row is normally created at sign-up.
    const { error } = await supabase
      .from("shops")
      .insert({ ...values, ...images, owner_id: ctx.user.id, status: "pending" });
    if (error) {
      console.error("[saveShopProfile:insert]", error.message);
      return { ok: false, error: "Дэлгүүр үүсгэхэд алдаа гарлаа." };
    }
  }

  updateTag(CATALOG_TAG);
  return { ok: true, message: "Дэлгүүрийн мэдээлэл хадгалагдлаа." };
}

/** Sets only the logo or cover (used right after registration). */
export async function updateShopImage(kind: "logo" | "cover", url: string): Promise<ActionResult> {
  const ctx = await ownerContext();
  if (!ctx?.shop) return DENIED;
  if (kind !== "logo" && kind !== "cover") return { ok: false, error: "Буруу хүсэлт." };
  if (!isOwnUpload(url, STORAGE_BUCKETS.shops, ctx.user.id)) {
    return { ok: false, error: "Зургийн холбоос буруу байна." };
  }
  const key = kind === "logo" ? "logo_url" : "cover_url";
  const supabase = await createClient();
  const { error } = await supabase.from("shops").update({ [key]: url }).eq("id", ctx.shop.id);
  if (error) return { ok: false, error: "Зураг хадгалахад алдаа гарлаа." };
  await removeFiles(STORAGE_BUCKETS.shops, [ctx.shop[key]]);
  updateTag(CATALOG_TAG);
  return { ok: true };
}

// ---------------------------------------------------------------- Products

function readProduct(formData: FormData) {
  return validateProduct({
    name: str(formData.get("name")),
    description: str(formData.get("description")),
    price: str(formData.get("price")),
    on_sale: formData.get("on_sale") === "on",
    original_price: str(formData.get("original_price")),
    category_id: str(formData.get("category_id")),
    size: str(formData.get("size")),
    condition: str(formData.get("condition")),
    is_available: formData.get("is_available") === "on" || formData.get("is_available") === "true",
  });
}

export async function saveProduct(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const ctx = await ownerContext();
  if (!ctx) return DENIED;
  if (!ctx.shop) return { ok: false, error: "Эхлээд дэлгүүрийн мэдээллээ бөглөнө үү." };

  const productId = str(formData.get("id"));
  if (productId && !isUuid(productId)) return { ok: false, error: "Буруу хүсэлт." };

  const { errors, values } = readProduct(formData);
  const images = formData.getAll("images").map((v) => str(v)).filter(Boolean);
  if (!images.length) errors.images = "Дор хаяж нэг зураг оруулна уу.";
  if (images.length > MAX_PRODUCT_IMAGES) errors.images = `Хамгийн ихдээ ${MAX_PRODUCT_IMAGES} зураг.`;
  if (new Set(images).size !== images.length) errors.images = "Давхардсан зураг байна.";
  if (Object.keys(errors).length) {
    return { ok: false, error: "Талбаруудаа шалгаад дахин оролдоно уу.", fieldErrors: errors };
  }

  const supabase = await createClient();
  const bucket = STORAGE_BUCKETS.products;

  // Images that are already attached to this product may stay (this also
  // covers demo images); anything new must be the owner's own upload.
  let existing: { id: string; image_url: string }[] = [];
  if (productId) {
    const { data: product } = await supabase
      .from("products")
      .select("id, product_images(id,image_url)")
      .eq("id", productId)
      .eq("shop_id", ctx.shop.id)
      .maybeSingle();
    if (!product) return { ok: false, error: "Бараа олдсонгүй." };
    existing = product.product_images as { id: string; image_url: string }[];
  }
  const existingUrls = new Set(existing.map((i) => i.image_url));
  if (images.some((u) => !existingUrls.has(u) && !isOwnUpload(u, bucket, ctx.user.id))) {
    return { ok: false, error: "Зургийн холбоос буруу байна. Зургаа дахин оруулна уу." };
  }

  let id = productId;
  if (productId) {
    const { error } = await supabase.from("products").update(values).eq("id", productId);
    if (error) {
      const plan = planError(error.message);
      if (plan) return { ok: false, error: plan };
      console.error("[saveProduct:update]", error.message);
      return { ok: false, error: "Хадгалахад алдаа гарлаа. Дахин оролдоно уу." };
    }
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...values, shop_id: ctx.shop.id })
      .select("id")
      .single();
    if (error || !data) {
      const plan = planError(error?.message);
      if (plan) return { ok: false, error: plan };
      console.error("[saveProduct:insert]", error?.message);
      return { ok: false, error: "Бараа нэмэхэд алдаа гарлаа. Дахин оролдоно уу." };
    }
    id = data.id as string;
  }

  // Replace the image list: delete removed rows, then upsert the new order.
  const removed = existing.filter((i) => !images.includes(i.image_url));
  if (removed.length) {
    await supabase.from("product_images").delete().in("id", removed.map((i) => i.id));
    await removeFiles(bucket, removed.map((i) => i.image_url));
  }
  for (const [order, url] of images.entries()) {
    const row = existing.find((i) => i.image_url === url);
    const { error } = row
      ? await supabase.from("product_images").update({ display_order: order }).eq("id", row.id)
      : await supabase.from("product_images").insert({ product_id: id, image_url: url, display_order: order });
    if (error) {
      console.error("[saveProduct:images]", error.message);
      return { ok: false, error: "Зураг хадгалахад алдаа гарлаа." };
    }
  }

  updateTag(CATALOG_TAG);
  return { ok: true, message: productId ? "Бараа шинэчлэгдлээ." : "Бараа нэмэгдлээ.", data: { id } };
}

export async function setProductAvailability(id: string, available: boolean): Promise<ActionResult> {
  const ctx = await ownerContext();
  if (!ctx?.shop || !isUuid(id)) return DENIED;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ is_available: Boolean(available) })
    .eq("id", id)
    .eq("shop_id", ctx.shop.id)
    .select("id");
  if (error || !data?.length) return { ok: false, error: planError(error?.message) ?? "Төлөв өөрчлөхөд алдаа гарлаа." };
  updateTag(CATALOG_TAG);
  return { ok: true, message: available ? "Худалдаанд гаргалаа." : "Зарагдсан гэж тэмдэглэлээ." };
}

export async function deleteOwnProduct(id: string): Promise<ActionResult> {
  const ctx = await ownerContext();
  if (!ctx?.shop || !isUuid(id)) return DENIED;
  const supabase = await createClient();
  const { data: images } = await supabase.from("product_images").select("image_url").eq("product_id", id);
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("shop_id", ctx.shop.id)
    .select("id");
  if (error || !data?.length) return { ok: false, error: "Устгахад алдаа гарлаа." };
  await removeFiles(STORAGE_BUCKETS.products, (images ?? []).map((i) => i.image_url as string));
  updateTag(CATALOG_TAG);
  return { ok: true, message: "Бараа устгагдлаа." };
}
