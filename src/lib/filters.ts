import { CONDITIONS, DISTRICTS, SIZE_OPTIONS, SORT_OPTIONS, type SortValue } from "./constants";
import type { ProductCondition } from "./types";

export type SearchParams = Record<string, string | string[] | undefined>;

export interface ProductFilters {
  q: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  sizes: string[];
  conditions: ProductCondition[];
  shop: string;
  /** Shop districts to include (empty = all). */
  districts: string[];
  /** Set when the districts came from "Миний ойролцоо" (affects the chip label). */
  near: boolean;
  sort: SortValue;
  page: number;
  includeSold: boolean;
  /** Only products with a sale price. */
  onSale: boolean;
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const all = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split(",")).filter(Boolean);

const toPrice = (v: string) => {
  const n = Number(v.replace(/[\s,₮]/g, ""));
  return v && Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
};

/** Reads the /products URL query string into a clean, validated object. */
export function parseProductFilters(sp: SearchParams): ProductFilters {
  const sort = first(sp.sort) as SortValue;
  const page = Number.parseInt(first(sp.page), 10);
  return {
    q: first(sp.q).trim().slice(0, 80),
    category: first(sp.category).slice(0, 60),
    minPrice: toPrice(first(sp.min)),
    maxPrice: toPrice(first(sp.max)),
    sizes: all(sp.size).filter((s) => SIZE_OPTIONS.includes(s)),
    conditions: all(sp.condition).filter((c): c is ProductCondition =>
      CONDITIONS.some((x) => x.value === c),
    ),
    shop: first(sp.shop).slice(0, 40),
    districts: all(sp.district).filter((d) => DISTRICTS.includes(d)),
    near: first(sp.near) === "1",
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : "newest",
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 500) : 1,
    includeSold: first(sp.sold) === "1",
    onSale: first(sp.sale) === "1",
  };
}

/** Builds a query string from filters, dropping defaults. */
export function filtersToQuery(f: Partial<ProductFilters>) {
  const params = new URLSearchParams();
  if (f.q) params.set("q", f.q);
  if (f.category) params.set("category", f.category);
  if (f.minPrice != null) params.set("min", String(f.minPrice));
  if (f.maxPrice != null) params.set("max", String(f.maxPrice));
  f.sizes?.forEach((s) => params.append("size", s));
  f.conditions?.forEach((c) => params.append("condition", c));
  if (f.shop) params.set("shop", f.shop);
  f.districts?.forEach((d) => params.append("district", d));
  if (f.near && f.districts?.length) params.set("near", "1");
  if (f.sort && f.sort !== "newest") params.set("sort", f.sort);
  if (f.onSale) params.set("sale", "1");
  if (f.includeSold) params.set("sold", "1");
  if (f.page && f.page > 1) params.set("page", String(f.page));
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function countActiveFilters(f: ProductFilters) {
  return (
    (f.category ? 1 : 0) +
    (f.minPrice != null || f.maxPrice != null ? 1 : 0) +
    f.sizes.length +
    f.conditions.length +
    (f.shop ? 1 : 0) +
    f.districts.length +
    (f.includeSold ? 1 : 0) +
    (f.onSale ? 1 : 0)
  );
}
