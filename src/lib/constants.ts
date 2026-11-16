import type { ProductCondition, ShopPlan, ShopStatus } from "./types";

export const SITE_NAME = "ThriftUB";
export const SITE_DESCRIPTION =
  "Улаанбаатарын second hand, vintage дэлгүүрүүдийн хувцсыг нэг дороос олж, дэлгүүртэй шууд холбогдоорой.";

export const PAGE_SIZE = 12;

export const CONDITIONS: { value: ProductCondition; label: string }[] = [
  { value: "new", label: "Шинэ" },
  { value: "excellent", label: "Маш сайн" },
  { value: "good", label: "Сайн" },
  { value: "used", label: "Хэрэглэсэн" },
];

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: "Шинэ",
  excellent: "Маш сайн",
  good: "Сайн",
  used: "Хэрэглэсэн",
};

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
export const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
export const ONE_SIZE = "Нэг хэмжээ";
export const SIZE_OPTIONS = [...CLOTHING_SIZES, ...SHOE_SIZES, ONE_SIZE];

export const DISTRICTS = [
  "Сүхбаатар",
  "Чингэлтэй",
  "Баянгол",
  "Баянзүрх",
  "Хан-Уул",
  "Сонгинохайрхан",
  "Налайх",
  "Багануур",
  "Багахангай",
];

/**
 * Rough centre of each district (lat, lng), used by "Миний ойролцоо" to pick
 * the nearest district. Shops only store a district, not exact coordinates.
 */
export const DISTRICT_CENTERS: Record<string, [number, number]> = {
  "Сүхбаатар": [47.93, 106.92],
  "Чингэлтэй": [47.94, 106.9],
  "Баянгол": [47.91, 106.86],
  "Баянзүрх": [47.91, 107.0],
  "Хан-Уул": [47.87, 106.88],
  "Сонгинохайрхан": [47.92, 106.78],
  "Налайх": [47.75, 107.27],
  "Багануур": [47.83, 108.37],
  "Багахангай": [47.36, 107.48],
};

/** ThriftUB's own Instagram. Shops DM it to buy or renew a package. */
export const THRIFTUB_INSTAGRAM = "https://www.instagram.com/ub_thriftmn";

export const PLANS: Record<ShopPlan, { label: string; limit: number | null; price: number; note: string }> = {
  trial: { label: "Эхний сар", limit: 200, price: 0, note: "Үнэгүй, 1 сар" },
  pro: { label: "Pro", limit: 500, price: 59000, note: "Энгийн дараалал" },
  premium: { label: "Premium", limit: 1000, price: 89000, note: "Pro-оос түрүүнд харагдана" },
  max: { label: "Max", limit: null, price: 139000, note: "Хамгийн түрүүнд харагдана" },
};

export const PAID_PLANS: ShopPlan[] = ["pro", "premium", "max"];

export const SHOP_STATUS_LABELS: Record<ShopStatus, string> = {
  pending: "Хүлээгдэж буй",
  approved: "Баталгаажсан",
  rejected: "Татгалзсан",
  suspended: "Түр хаасан",
};

export const SORT_OPTIONS = [
  { value: "mixed", label: "Холимог" },
  { value: "newest", label: "Шинээр нэмэгдсэн" },
  { value: "price_asc", label: "Үнэ: багаас их" },
  { value: "price_desc", label: "Үнэ: ихээс бага" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const STORAGE_BUCKETS = {
  products: "product-images",
  shops: "shop-images",
} as const;

export const MAX_PRODUCT_IMAGES = 6;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
