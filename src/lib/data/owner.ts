import "server-only";
import { getCurrentUser, getOwnShop } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product, ProductImage } from "@/lib/types";

// Reads for the shop owner dashboard. They run as the signed-in user, so RLS
// limits them to the owner's own shop. Not cached: owners must see their
// edits immediately.

export type OwnerProduct = Product & { images: ProductImage[]; category: Pick<Category, "id" | "name"> | null };

export async function getOwnProducts(status: "all" | "available" | "sold" = "all", q = "") {
  const shop = await getOwnShop();
  if (!shop) return [];
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, images:product_images(*), category:categories(id,name)")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });
  if (status === "available") query = query.eq("is_available", true);
  if (status === "sold") query = query.eq("is_available", false);
  if (q) query = query.ilike("name", `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);

  const { data, error } = await query;
  if (error) throw new Error(`Бараа ачаалж чадсангүй: ${error.message}`);
  return (data as OwnerProduct[]).map((p) => ({
    ...p,
    images: [...p.images].sort((a, b) => a.display_order - b.display_order),
  }));
}

export async function getOwnProduct(id: string) {
  const shop = await getOwnShop();
  if (!shop) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, images:product_images(*), category:categories(id,name)")
    .eq("id", id)
    .eq("shop_id", shop.id)
    .maybeSingle();
  if (!data) return null;
  const p = data as OwnerProduct;
  return { ...p, images: [...p.images].sort((a, b) => a.display_order - b.display_order) };
}

export async function getOwnStats() {
  const shop = await getOwnShop();
  if (!shop) return { total: 0, available: 0, sold: 0 };
  const supabase = await createClient();
  const count = async (available?: boolean) => {
    let q = supabase.from("products").select("id", { count: "exact", head: true }).eq("shop_id", shop.id);
    if (available !== undefined) q = q.eq("is_available", available);
    const { count } = await q;
    return count ?? 0;
  };
  const [total, available, sold] = await Promise.all([count(), count(true), count(false)]);
  return { total, available, sold };
}

export { getCurrentUser, getOwnShop };
