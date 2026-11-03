// Database row types. These mirror supabase/migrations/0001_schema.sql.
// (You can also generate them with `npx supabase gen types typescript`.)

export type UserRole = "customer" | "shop_owner" | "admin";
export type ShopStatus = "pending" | "approved" | "rejected" | "suspended";
export type ProductCondition = "new" | "excellent" | "good" | "used";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
}

export interface Shop {
  id: string;
  owner_id: string | null;
  name: string;
  description: string;
  logo_url: string | null;
  cover_url: string | null;
  phone: string;
  instagram_url: string | null;
  facebook_url: string | null;
  address: string;
  district: string | null;
  status: ShopStatus;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  size: string;
  condition: ProductCondition;
  is_available: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

// ---------- View models used by the UI ----------

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  size: string;
  condition: ProductCondition;
  is_available: boolean;
  is_demo: boolean;
  image_url: string | null;
  shop: { id: string; name: string };
}

export interface ProductDetail extends Product {
  images: ProductImage[];
  category: Category | null;
  shop: Shop;
}

export interface ShopWithCount extends Shop {
  available_count: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
