// ⚠️ DEMONSTRATION DATA — not real shops or products.
// Used in two places:
//   1. The app shows this data when Supabase is not configured yet (demo mode).
//   2. `npm run seed:generate` turns it into supabase/seed.sql.
// Every shop and product here is flagged with is_demo = true.
// Images are clean product illustrations in /public/demo (drawn for Thrift.mn
// in the brand palette), so the catalog looks consistent and on-brand.
//
// This file must stay plain TypeScript with type-only imports so Node can
// run it directly (see scripts/generate-seed.ts).

import type { Category, Product, ProductImage, Shop } from "./types";

const img = (slug: string) => `/demo/products/${slug}.webp`;
const cover = (n: number) => `/demo/shops/rack-${n}.webp`;

const uuid = (group: number, n: number) =>
  `00000000-0000-4000-8000-${String(group * 1000 + n).padStart(12, "0")}`;

export const HERO_IMAGE = img("hoodie-stone");
export const HERO_SECONDARY_IMAGE = img("cardigan-forest");

// ---------- Categories ----------
const cat = (n: number, name: string, slug: string, photo: string): Category => ({
  id: uuid(1, n),
  name,
  slug,
  image_url: img(photo),
  sort_order: n,
});

export const DEMO_CATEGORIES: Category[] = [
  cat(1, "Эрэгтэй хувцас", "men", "coat-charcoal"),
  cat(2, "Эмэгтэй хувцас", "women", "cardigan-cream"),
  cat(3, "Гадуур хувцас", "outerwear", "bomber-olive"),
  cat(4, "Цамц", "tops", "hoodie-stone"),
  cat(5, "Өмд", "pants", "jeans-indigo"),
  cat(6, "Гутал", "shoes", "boot-brown"),
  cat(7, "Цүнх", "bags", "crossbody-brown"),
  cat(8, "Accessories", "accessories", "beanie-moss"),
];

const catId = (slug: string) => DEMO_CATEGORIES.find((c) => c.slug === slug)!.id;

// ---------- Shops ----------
const shop = (
  n: number,
  data: Pick<Shop, "name" | "description" | "phone" | "address" | "district"> & {
    handle: string;
    cover: number;
  },
): Shop => ({
  id: uuid(2, n),
  owner_id: null,
  name: data.name,
  description: data.description,
  logo_url: null,
  cover_url: cover(data.cover),
  phone: data.phone,
  instagram_url: `https://www.instagram.com/${data.handle}`,
  facebook_url: `https://www.facebook.com/${data.handle}`,
  address: data.address,
  district: data.district,
  status: "approved",
  is_demo: true,
  created_at: `2026-0${n}-15T09:00:00.000Z`,
  updated_at: `2026-0${n}-15T09:00:00.000Z`,
});

export const DEMO_SHOPS: Shop[] = [
  shop(1, {
    name: "Vintage UB",
    handle: "vintageub.demo",
    description:
      "Европ, Японоос сонгон авчирсан vintage хувцас, арьсан куртик, цүнхний дэлгүүр. Долоо хоног бүр шинэ бараа ирдэг.",
    phone: "99110001",
    address: "Сүхбаатар дүүрэг, 1-р хороо, Их тойруу 15, 2 давхар",
    district: "Сүхбаатар",
    cover: 1,
  }),
  shop(2, {
    name: "Second Chance",
    handle: "secondchance.demo",
    description:
      "Чанартай хувцсанд хоёр дахь боломж олгоно. Жинс, костюм, өдөр тутмын энгийн хувцас боломжийн үнээр.",
    phone: "99110002",
    address: "Баянгол дүүрэг, 3-р хороо, Энхтайвны өргөн чөлөө 42",
    district: "Баянгол",
    cover: 2,
  }),
  shop(3, {
    name: "Retro Closet",
    handle: "retrocloset.demo",
    description:
      "70–90-ээд оны ретро стиль: сүлжмэл кардиган, пальто, футболк, арьсан гутал гээд өвөрмөц сонголтууд.",
    phone: "99110003",
    address: "Чингэлтэй дүүрэг, 4-р хороо, Бага тойруу 8",
    district: "Чингэлтэй",
    cover: 3,
  }),
  shop(4, {
    name: "Thrift House",
    handle: "thrifthouse.demo",
    description:
      "Ноосон пальто, сүлжмэл эдлэл, гутал. Бараа бүрийг цэвэрлэж, шалгаж байж худалдаалдаг.",
    phone: "99110004",
    address: "Хан-Уул дүүрэг, 15-р хороо, Чингисийн өргөн чөлөө 21",
    district: "Хан-Уул",
    cover: 4,
  }),
  shop(5, {
    name: "Urban Vintage",
    handle: "urbanvintage.demo",
    description:
      "Хотын залууст зориулсан стрийт стиль: hoodie, бомбер, жинс, пүүз, малгай.",
    phone: "99110005",
    address: "Баянзүрх дүүрэг, 26-р хороо, Их Монгол улсын гудамж 5",
    district: "Баянзүрх",
    cover: 5,
  }),
];

// ---------- Products ----------
type DemoProductInput = Pick<
  Product,
  "name" | "description" | "price" | "size" | "condition"
> & { shop: number; category: string; photos: string[]; sold?: boolean };

const products: DemoProductInput[] = [
  { shop: 5, category: "tops", name: "Саарал оверсайз hoodie", price: 65000, size: "L", condition: "excellent", photos: ["hoodie-stone"],
    description: "Зузаан хөвөн даавуун, чөлөөтэй загвартай hoodie. Дотроо зөөлөн хөвөнтэй, урд халаастай. Мөрний өргөн 58 см." },
  { shop: 4, category: "outerwear", name: "Тэмээн өнгийн пальто", price: 175000, size: "M", condition: "excellent", photos: ["coat-camel"],
    description: "80% ноостой хоёр эгнээ товчтой урт пальто. Химийн цэвэрлэгээнд оруулсан." },
  { shop: 3, category: "women", name: "Ногоон сүлжмэл кардиган", price: 72000, size: "M", condition: "excellent", photos: ["cardigan-forest"],
    description: "Гүн ногоон, гоёл хээтэй ноосон кардиган. Товч бүрэн, дулаахан." },
  { shop: 1, category: "shoes", name: "Бор арьсан челси гутал", price: 120000, size: "42", condition: "good", photos: ["boot-brown"],
    description: "Жинхэнэ арьсан бор челси гутал. Ул нь бат бөх. Хэмжээ EU 42." },
  { shop: 3, category: "tops", name: "Ногоон hoodie", price: 59000, size: "M", condition: "excellent", photos: ["hoodie-forest"],
    description: "Гүн ногоон өнгийн hoodie. Өнгө нь гандаагүй, ширхэг үүсээгүй." },
  { shop: 1, category: "outerwear", name: "Хаки бомбер куртик", price: 98000, size: "M", condition: "excellent", photos: ["bomber-olive"],
    description: "Хаки ногоон бомбер. Цахилгаан товч бүрэн ажилладаг, зах, ханцуй, хормойдоо резинтэй." },
  { shop: 2, category: "pants", name: "Хар хөх жинс", price: 55000, size: "M", condition: "excellent", photos: ["jeans-indigo"],
    description: "Хар хөх өнгийн шулуун жинс. Бүсэлхий W32, урт L32." },
  { shop: 3, category: "bags", name: "Бор арьсан мөрний цүнх", price: 88000, size: "Нэг хэмжээ", condition: "excellent", photos: ["crossbody-brown"],
    description: "Жинхэнэ арьсан бор цүнх, металл түгжээтэй. Тохируулдаг оосортой." },
  { shop: 4, category: "tops", name: "Цөцгий өнгийн hoodie", price: 62000, size: "M", condition: "excellent", photos: ["hoodie-cream"],
    description: "Зөөлөн цөцгий өнгийн, дотроо хөвөнтэй hoodie. Урд том халаастай." },
  { shop: 3, category: "women", name: "Шалбаа ногоон цамц", price: 38000, size: "S", condition: "excellent", photos: ["shirt-sage"],
    description: "Зөөлөн шалбаа ногоон өнгийн чөлөөтэй цамц. Өдөр тутам, ажилд аль алинд нь зохино." },
  { shop: 5, category: "shoes", name: "Цагаан пүүз", price: 85000, size: "40", condition: "excellent", photos: ["sneaker-white"],
    description: "Цэвэрхэн цагаан пүүз. Аливаа хувцастай зохицно. Хэмжээ EU 40." },
  { shop: 4, category: "accessories", name: "Ногоон сүлжмэл малгай", price: 15000, size: "Нэг хэмжээ", condition: "new", photos: ["beanie-moss"],
    description: "Хөвд ногоон өнгийн зөөлөн сүлжмэл малгай. Шинэ, шошготой." },
  { shop: 5, category: "men", name: "Хар саарал hoodie", price: 60000, size: "XL", condition: "excellent", photos: ["hoodie-charcoal"],
    description: "Хар саарал өнгийн зузаан hoodie. Чөлөөтэй, том загвартай." },
  { shop: 2, category: "men", name: "Хар саарал пальто", price: 160000, size: "L", condition: "good", photos: ["coat-charcoal"],
    description: "Сонгодог загварын хар саарал ноосон пальто. Доторлогоо бүтэн." },
  { shop: 2, category: "bags", name: "Даавуун тоут цүнх", price: 18000, size: "Нэг хэмжээ", condition: "new", photos: ["tote-canvas"],
    description: "Зузаан цагаан даавуун тоут цүнх. Шинэ." },
  { shop: 2, category: "tops", name: "Шалбаа ногоон свитшот", price: 45000, size: "M", condition: "excellent", photos: ["sweatshirt-sage"],
    description: "Зөөлөн шалбаа ногоон өнгийн дугуй захтай свитшот. Ханцуй, хормойдоо резин сүлжээтэй." },
  { shop: 3, category: "tops", name: "Шар ногоон hoodie", price: 69000, size: "M", condition: "new", photos: ["hoodie-lime"],
    description: "Тод шар ногоон өнгийн hoodie — анхаарал татах нэг ширхэг. Шинэ, шошготой." },
  { shop: 4, category: "women", name: "Цөцгий кардиган", price: 68000, size: "S", condition: "good", photos: ["cardigan-cream"],
    description: "Цөцгий өнгийн зөөлөн сүлжмэл кардиган. Бага зэрэг элэгдэлтэй." },
  { shop: 1, category: "pants", name: "Хаки өмд", price: 45000, size: "M", condition: "excellent", photos: ["pants-olive"],
    description: "Шулуун загвартай хаки өмд. Ажил, өдөр тутамд өмсөхөд тохиромжтой." },
  { shop: 5, category: "accessories", name: "Хар саарал бейсболк", price: 20000, size: "Нэг хэмжээ", condition: "excellent", photos: ["cap-charcoal"],
    description: "Ар талдаа тохируулагчтай хар саарал бейсболк." },
  { shop: 3, category: "tops", name: "Тэмээн өнгийн hoodie", price: 64000, size: "M", condition: "excellent", photos: ["hoodie-camel"],
    description: "Дулаан тэмээн бор өнгийн hoodie. Өнгө нь гандаагүй." },
  { shop: 5, category: "outerwear", name: "Хар бомбер куртик", price: 89000, size: "L", condition: "good", photos: ["bomber-black"],
    description: "Хар өнгийн хөнгөн бомбер. Ханцуйн үзүүрт бага зэрэг элэгдэлтэй." },
  { shop: 2, category: "tops", name: "Энгийн цагаан футболк", price: 22000, size: "M", condition: "new", photos: ["tee-cream"],
    description: "Зузаан хөвөн даавуун цагаан футболк. Шинэ, шошготой." },
  { shop: 5, category: "pants", name: "Цайвар жинс", price: 52000, size: "L", condition: "good", photos: ["jeans-light"],
    description: "Цайвар цэнхэр, шулуун загвартай жинс. Бүсэлхий W33." },
  { shop: 2, category: "tops", name: "Шалбаа ногоон hoodie", price: 58000, size: "S", condition: "excellent", photos: ["hoodie-sage"],
    description: "Цайвар шалбаа ногоон hoodie. Нэг улирал өмссөн, цэвэрхэн." },
  { shop: 1, category: "men", name: "Цагаан товчтой цамц", price: 35000, size: "M", condition: "new", photos: ["shirt-stone"],
    description: "Шошготой, шинэ цагаан цамц. 100% хөвөн, индүүдэхэд амархан." },
  { shop: 1, category: "accessories", name: "Тэмээн өнгийн сүлжмэл малгай", price: 15000, size: "Нэг хэмжээ", condition: "excellent", photos: ["beanie-camel"],
    description: "Тэмээн бор өнгийн дулаан сүлжмэл малгай." },
  { shop: 4, category: "women", name: "Цөцгий өнгийн свитшот", price: 42000, size: "S", condition: "new", photos: ["sweatshirt-cream"],
    description: "Шошготой, шинэ цөцгий өнгийн свитшот. 100% хөвөн." },
  { shop: 1, category: "tops", name: "Хаки hoodie", price: 55000, size: "L", condition: "good", photos: ["hoodie-olive"],
    description: "Хаки ногоон өнгийн оверсайз hoodie. Ханцуйн үзүүрт бага зэрэг элэгдэлтэй." },
  { shop: 5, category: "men", name: "Хар саарал футболк", price: 25000, size: "L", condition: "excellent", photos: ["tee-charcoal"],
    description: "Хар саарал өнгийн энгийн футболк. Нэг удаа өмссөн." },
  { shop: 5, category: "tops", name: "Хар hoodie", price: 57000, size: "L", condition: "good", photos: ["hoodie-black"],
    description: "Сонгодог хар hoodie. Аливаа хувцастай зохицно." },
  { shop: 3, category: "shoes", name: "Хар арьсан челси гутал", price: 110000, size: "41", condition: "excellent", photos: ["boot-black"], sold: true,
    description: "Гялгар хар арьсан челси гутал. Хэмжээ EU 41." },
];

export const DEMO_PRODUCTS: Product[] = products.map((p, i) => {
  // Newer items first: each product is "uploaded" one hour before the previous.
  const created = new Date(Date.UTC(2026, 9, 30, 12 - i, 0, 0)).toISOString();
  return {
    id: uuid(3, i + 1),
    shop_id: uuid(2, p.shop),
    category_id: catId(p.category),
    name: p.name,
    description: p.description,
    price: p.price,
    size: p.size,
    condition: p.condition,
    is_available: !p.sold,
    is_demo: true,
    created_at: created,
    updated_at: created,
  };
});

export const DEMO_PRODUCT_IMAGES: ProductImage[] = products.flatMap((p, i) =>
  p.photos.map((photo, order) => ({
    id: uuid(4, (i + 1) * 10 + order),
    product_id: uuid(3, i + 1),
    image_url: img(photo),
    display_order: order,
  })),
);
