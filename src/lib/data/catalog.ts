import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { PAGE_SIZE } from "@/lib/constants";
import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_PRODUCT_IMAGES,
  DEMO_SHOPS,
} from "@/lib/demo-data";
import type { ProductFilters } from "@/lib/filters";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";
import type {
  Category,
  Paginated,
  Product,
  ProductCardData,
  ProductDetail,
  ProductImage,
  Shop,
  ShopWithCount,
} from "@/lib/types";
import { isUuid } from "@/lib/validation";

// Public catalog reads. They use the anonymous Supabase client, so results
// are identical for every visitor and can be cached. Every mutation calls
// updateTag(CATALOG_TAG) to refresh them.

export const CATALOG_TAG = "catalog";

const CARD_SELECT =
  "id,name,price,size,condition,is_available,is_demo,created_at,shop:shops!inner(id,name,district),product_images(image_url,display_order)";

type CardRow = Omit<ProductCardData, "image_url" | "shop"> & {
  shop: { id: string; name: string } | { id: string; name: string }[];
  product_images: { image_url: string; display_order: number }[] | null;
};

function toCard(row: CardRow): ProductCardData {
  const shop = Array.isArray(row.shop) ? row.shop[0]! : row.shop;
  const images = [...(row.product_images ?? [])].sort((a, b) => a.display_order - b.display_order);
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    size: row.size,
    condition: row.condition,
    is_available: row.is_available,
    is_demo: row.is_demo,
    image_url: images[0]?.image_url ?? null,
    shop: { id: shop.id, name: shop.name },
  };
}

function fail(what: string, error: { message: string }): never {
  console.error(`[catalog] ${what}:`, error.message);
  throw new Error(`Мэдээлэл ачаалж чадсангүй (${what}).`);
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/** Resets the ordering boost of shops whose paid package ran out (see 0004_plans.sql). */
async function expirePlans() {
  const { error } = await createPublicClient().rpc("expire_plans");
  if (error) console.error("[catalog] expire_plans:", error.message);
}

// ---------- Demo-mode helpers ----------

function demoCard(p: Product): ProductCardData {
  const shop = DEMO_SHOPS.find((s) => s.id === p.shop_id)!;
  const image = DEMO_PRODUCT_IMAGES.find((i) => i.product_id === p.id && i.display_order === 0);
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    size: p.size,
    condition: p.condition,
    is_available: p.is_available,
    is_demo: true,
    image_url: image?.image_url ?? null,
    shop: { id: shop.id, name: shop.name },
  };
}

function demoShopWithCount(s: Shop): ShopWithCount {
  return {
    ...s,
    available_count: DEMO_PRODUCTS.filter((p) => p.shop_id === s.id && p.is_available).length,
  };
}

// ---------- Categories ----------

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  if (!isSupabaseConfigured) return DEMO_CATEGORIES;

  const { data, error } = await createPublicClient()
    .from("categories")
    .select("id,name,slug,image_url,sort_order")
    .order("sort_order")
    .order("name");
  if (error) fail("ангилал", error);
  return data as Category[];
}

// ---------- Products ----------

export async function getProducts(filters: ProductFilters): Promise<Paginated<ProductCardData>> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const categories = await getCategories();
  const category = filters.category
    ? categories.find((c) => c.slug === filters.category)
    : undefined;
  // Unknown category slug → no results rather than ignoring the filter.
  if (filters.category && !category) return { items: [], total: 0, page: 1, pageCount: 0 };
  if (filters.shop && !isUuid(filters.shop)) return { items: [], total: 0, page: 1, pageCount: 0 };

  const from = (filters.page - 1) * PAGE_SIZE;

  if (!isSupabaseConfigured) {
    const q = filters.q.toLowerCase();
    let list = DEMO_PRODUCTS.filter(
      (p) =>
        (filters.includeSold || p.is_available) &&
        (!q || p.name.toLowerCase().includes(q)) &&
        (!category || p.category_id === category.id) &&
        (filters.minPrice == null || p.price >= filters.minPrice) &&
        (filters.maxPrice == null || p.price <= filters.maxPrice) &&
        (!filters.sizes.length || filters.sizes.includes(p.size)) &&
        (!filters.conditions.length || filters.conditions.includes(p.condition)) &&
        (!filters.shop || p.shop_id === filters.shop) &&
        (!filters.districts.length ||
          filters.districts.includes(DEMO_SHOPS.find((s) => s.id === p.shop_id)?.district ?? "")),
    );
    list = [...list].sort((a, b) =>
      filters.sort === "price_asc"
        ? a.price - b.price
        : filters.sort === "price_desc"
          ? b.price - a.price
          : b.created_at.localeCompare(a.created_at),
    );
    return {
      items: list.slice(from, from + PAGE_SIZE).map(demoCard),
      total: list.length,
      page: filters.page,
      pageCount: Math.ceil(list.length / PAGE_SIZE),
    };
  }

  let query = createPublicClient()
    .from("products")
    .select(CARD_SELECT, { count: "exact" })
    .order("display_order", { referencedTable: "product_images" })
    .limit(1, { referencedTable: "product_images" });

  if (!filters.includeSold) query = query.eq("is_available", true);
  if (filters.q) query = query.ilike("name", `%${escapeLike(filters.q)}%`);
  if (category) query = query.eq("category_id", category.id);
  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
  if (filters.sizes.length) query = query.in("size", filters.sizes);
  if (filters.conditions.length) query = query.in("condition", filters.conditions);
  if (filters.shop) query = query.eq("shop_id", filters.shop);
  if (filters.districts.length) query = query.in("shop.district", filters.districts);

  query =
    filters.sort === "price_asc"
      ? query.order("price", { ascending: true }).order("created_at", { ascending: false })
      : filters.sort === "price_desc"
        ? query.order("price", { ascending: false }).order("created_at", { ascending: false })
        : // Default order: bigger packages first (Max → Premium → Pro), then newest.
          query.order("boost", { ascending: false }).order("created_at", { ascending: false });

  await expirePlans();
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);
  // Asking for a page past the end returns a range error — treat it as empty.
  if (error && error.code !== "PGRST103") fail("бараа", error);
  const total = count ?? 0;
  return {
    items: ((data ?? []) as unknown as CardRow[]).map(toCard),
    total,
    page: filters.page,
    pageCount: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getLatestProducts(limit = 8): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  if (!isSupabaseConfigured) {
    return DEMO_PRODUCTS.filter((p) => p.is_available).slice(0, limit).map(demoCard);
  }

  await expirePlans();
  const { data, error } = await createPublicClient()
    .from("products")
    .select(CARD_SELECT)
    .eq("is_available", true)
    .order("boost", { ascending: false })
    .order("created_at", { ascending: false })
    .order("display_order", { referencedTable: "product_images" })
    .limit(1, { referencedTable: "product_images" })
    .limit(limit);
  if (error) fail("шинэ бараа", error);
  return (data as unknown as CardRow[]).map(toCard);
}

export async function getProductById(id: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  if (!isUuid(id)) return null;

  if (!isSupabaseConfigured) {
    const p = DEMO_PRODUCTS.find((x) => x.id === id);
    if (!p) return null;
    return {
      ...p,
      images: DEMO_PRODUCT_IMAGES.filter((i) => i.product_id === id),
      category: DEMO_CATEGORIES.find((c) => c.id === p.category_id) ?? null,
      shop: DEMO_SHOPS.find((s) => s.id === p.shop_id)!,
    };
  }

  const { data, error } = await createPublicClient()
    .from("products")
    .select("*, images:product_images(*), category:categories(*), shop:shops!inner(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) fail("барааны дэлгэрэнгүй", error);
  if (!data) return null;
  const row = data as ProductDetail & { images: ProductImage[] };
  return { ...row, images: [...row.images].sort((a, b) => a.display_order - b.display_order) };
}

export async function getMoreFromShop(shopId: string, excludeId: string, limit = 4) {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  if (!isSupabaseConfigured) {
    return DEMO_PRODUCTS.filter((p) => p.shop_id === shopId && p.id !== excludeId && p.is_available)
      .slice(0, limit)
      .map(demoCard);
  }

  const { data, error } = await createPublicClient()
    .from("products")
    .select(CARD_SELECT)
    .eq("shop_id", shopId)
    .eq("is_available", true)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .order("display_order", { referencedTable: "product_images" })
    .limit(1, { referencedTable: "product_images" })
    .limit(limit);
  if (error) fail("дэлгүүрийн бусад бараа", error);
  return (data as unknown as CardRow[]).map(toCard);
}

// ---------- Shops ----------

type ShopRow = Shop & { products: { count: number }[] };
const toShopWithCount = (row: ShopRow): ShopWithCount => {
  const { products, ...shop } = row;
  return { ...shop, available_count: products?.[0]?.count ?? 0 };
};

export async function getShops(
  filters: { q?: string; district?: string } = {},
): Promise<ShopWithCount[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const q = (filters.q ?? "").trim().toLowerCase();

  if (!isSupabaseConfigured) {
    return DEMO_SHOPS.filter(
      (s) =>
        (!q || s.name.toLowerCase().includes(q)) &&
        (!filters.district || s.district === filters.district),
    ).map(demoShopWithCount);
  }

  let query = createPublicClient()
    .from("shops")
    .select("*, products(count)")
    .eq("status", "approved")
    .eq("products.is_available", true)
    .order("name");
  if (q) query = query.ilike("name", `%${escapeLike(q)}%`);
  if (filters.district) query = query.eq("district", filters.district);

  const { data, error } = await query;
  if (error) fail("дэлгүүрүүд", error);
  return (data as ShopRow[]).map(toShopWithCount);
}

export async function getPopularShops(limit = 4) {
  const shops = await getShops();
  return [...shops].sort((a, b) => b.available_count - a.available_count).slice(0, limit);
}

export async function getShopById(id: string): Promise<ShopWithCount | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  if (!isUuid(id)) return null;

  if (!isSupabaseConfigured) {
    const s = DEMO_SHOPS.find((x) => x.id === id);
    return s ? demoShopWithCount(s) : null;
  }

  const { data, error } = await createPublicClient()
    .from("shops")
    .select("*, products(count)")
    .eq("id", id)
    .eq("status", "approved")
    .eq("products.is_available", true)
    .maybeSingle();
  if (error) fail("дэлгүүр", error);
  return data ? toShopWithCount(data as ShopRow) : null;
}

/** Categories that have at least one available product in this shop. */
export async function getShopCategories(shopId: string): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const categories = await getCategories();
  let ids: (string | null)[];

  if (!isSupabaseConfigured) {
    ids = DEMO_PRODUCTS.filter((p) => p.shop_id === shopId && p.is_available).map(
      (p) => p.category_id,
    );
  } else {
    const { data, error } = await createPublicClient()
      .from("products")
      .select("category_id")
      .eq("shop_id", shopId)
      .eq("is_available", true);
    if (error) fail("дэлгүүрийн ангилал", error);
    ids = data.map((r) => r.category_id as string | null);
  }

  const set = new Set(ids);
  return categories.filter((c) => set.has(c.id));
}

/** Product and shop ids for the sitemap. */
export async function getSitemapEntries() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  if (!isSupabaseConfigured) {
    return {
      products: DEMO_PRODUCTS.filter((p) => p.is_available).map((p) => ({ id: p.id, updated_at: p.updated_at })),
      shops: DEMO_SHOPS.map((s) => ({ id: s.id, updated_at: s.updated_at })),
    };
  }

  const client = createPublicClient();
  const [products, shops] = await Promise.all([
    client.from("products").select("id,updated_at").eq("is_available", true).limit(5000),
    client.from("shops").select("id,updated_at").eq("status", "approved"),
  ]);
  if (products.error) fail("sitemap", products.error);
  if (shops.error) fail("sitemap", shops.error);
  return { products: products.data, shops: shops.data };
}
