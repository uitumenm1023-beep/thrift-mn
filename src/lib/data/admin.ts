import "server-only";
import { requireRole } from "@/lib/auth";
import { PAGE_SIZE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Paginated, Product, Shop, ShopStatus } from "@/lib/types";

// Reads for the admin dashboard. They run as the signed-in admin; RLS
// (is_admin()) is what lets them see pending and suspended shops.
// Each one checks the role itself too: Next renders a page in parallel with
// its layout, so the layout's gate alone does not stop these from running.

export type AdminShop = Shop & { owner: { full_name: string } | null; products: { count: number }[] };
export type AdminProduct = Product & {
  shop: Pick<Shop, "id" | "name" | "status">;
  images: { image_url: string; display_order: number }[];
};

export async function getAdminStats() {
  if (!isSupabaseConfigured) return { shops: 0, pending: 0, approved: 0, suspended: 0, products: 0, available: 0, owners: 0 };
  await requireRole("admin");
  const supabase = await createClient();
  const shopCount = async (status?: ShopStatus) => {
    let q = supabase.from("shops").select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    return (await q).count ?? 0;
  };
  const productCount = async (available?: boolean) => {
    let q = supabase.from("products").select("id", { count: "exact", head: true });
    if (available !== undefined) q = q.eq("is_available", available);
    return (await q).count ?? 0;
  };
  const [shops, pending, approved, suspended, products, available, owners] = await Promise.all([
    shopCount(),
    shopCount("pending"),
    shopCount("approved"),
    shopCount("suspended"),
    productCount(),
    productCount(true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "shop_owner").then((r) => r.count ?? 0),
  ]);
  return { shops, pending, approved, suspended, products, available, owners };
}

export async function getAdminShops(status?: ShopStatus, q = ""): Promise<AdminShop[]> {
  if (!isSupabaseConfigured) return [];
  await requireRole("admin");
  const supabase = await createClient();
  let query = supabase
    .from("shops")
    .select("*, owner:profiles(full_name), products(count)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (q) query = query.ilike("name", `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
  const { data, error } = await query;
  if (error) throw new Error(`Дэлгүүрүүд ачаалж чадсангүй: ${error.message}`);
  return data as AdminShop[];
}

export async function getAdminProducts(q: string, page: number): Promise<Paginated<AdminProduct>> {
  if (!isSupabaseConfigured) return { items: [], total: 0, page, pageCount: 0 };
  await requireRole("admin");
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE * 2;
  let query = supabase
    .from("products")
    .select("*, shop:shops!inner(id,name,status), images:product_images(image_url,display_order)", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("display_order", { referencedTable: "product_images" })
    .limit(1, { referencedTable: "product_images" });
  if (q) query = query.ilike("name", `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
  const { data, error, count } = await query.range(from, from + PAGE_SIZE * 2 - 1);
  if (error && error.code !== "PGRST103") throw new Error(`Бараа ачаалж чадсангүй: ${error.message}`);
  const total = count ?? 0;
  return { items: (data ?? []) as AdminProduct[], total, page, pageCount: Math.ceil(total / (PAGE_SIZE * 2)) };
}
