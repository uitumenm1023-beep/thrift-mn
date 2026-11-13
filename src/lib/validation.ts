// Form validation shared by the browser (instant feedback) and Server
// Actions (the real check — never trust the browser).

import { CONDITIONS, DISTRICTS, SIZE_OPTIONS } from "./constants";
import type { ProductCondition } from "./types";

export type FieldErrors = Record<string, string>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);

export const str = (v: FormDataEntryValue | null | undefined) =>
  typeof v === "string" ? v.trim() : "";

/** Accepts "@handle", "handle" or any instagram.com URL. Returns a full URL or null. */
export function normalizeInstagram(input: string): string | null | false {
  const value = input.trim();
  if (!value) return null;
  const match =
    value.match(/^@?([a-zA-Z0-9._]{1,30})$/) ??
    value.match(/^(?:https?:\/\/)?(?:www\.|m\.)?instagram\.com\/([a-zA-Z0-9._]{1,30})\/?(?:\?.*)?$/i);
  return match ? `https://www.instagram.com/${match[1]}` : false;
}

/** Accepts a page name or any facebook.com / fb.com URL. Returns a full URL or null. */
export function normalizeFacebook(input: string): string | null | false {
  const value = input.trim();
  if (!value) return null;
  if (/^[a-zA-Z0-9.\-]{2,80}$/.test(value)) return `https://www.facebook.com/${value}`;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    const host = url.hostname.replace(/^(www|m|web)\./, "");
    if (host !== "facebook.com" && host !== "fb.com") return false;
    if (url.pathname.length < 2) return false;
    return `https://www.facebook.com${url.pathname}${url.search}`;
  } catch {
    return false;
  }
}

/** Mongolian numbers: 8 digits, optionally prefixed with +976. */
export function normalizePhone(input: string): string | false {
  const digits = input.replace(/[\s\-()]/g, "");
  const m = digits.match(/^(?:\+?976)?(\d{8})$/);
  return m ? m[1]! : false;
}

export interface ShopInput {
  name: string;
  description: string;
  phone: string;
  instagram_url: string;
  facebook_url: string;
  address: string;
  district: string;
}

export function validateShop(input: ShopInput) {
  const errors: FieldErrors = {};
  if (input.name.length < 2 || input.name.length > 80)
    errors.name = "Дэлгүүрийн нэр 2–80 тэмдэгт байна.";
  if (input.description.length > 2000)
    errors.description = "Тайлбар 2000 тэмдэгтээс хэтрэхгүй.";
  const phone = normalizePhone(input.phone);
  if (!phone) errors.phone = "Утасны дугаар 8 оронтой байна. Жишээ нь: 99112233";
  const instagram = normalizeInstagram(input.instagram_url);
  if (instagram === false) errors.instagram_url = "Instagram хаяг буруу байна. Жишээ нь: @tanii_delguur";
  const facebook = normalizeFacebook(input.facebook_url);
  if (facebook === false) errors.facebook_url = "Facebook хуудасны холбоос буруу байна.";
  if (input.address.length < 5 || input.address.length > 300)
    errors.address = "Хаягаа дэлгэрэнгүй бичнэ үү (5–300 тэмдэгт).";
  if (input.district && !DISTRICTS.includes(input.district))
    errors.district = "Дүүргээ жагсаалтаас сонгоно уу.";

  return {
    errors,
    values: {
      name: input.name,
      description: input.description,
      phone: phone || "",
      instagram_url: instagram || null,
      facebook_url: facebook || null,
      address: input.address,
      district: input.district || null,
    },
  };
}

export interface ProductInput {
  name: string;
  description: string;
  price: string;
  /** "Хямдралтай" checkbox and the price before the discount. */
  on_sale: boolean;
  original_price: string;
  category_id: string;
  size: string;
  condition: string;
  is_available: boolean;
}

export function validateProduct(input: ProductInput) {
  const errors: FieldErrors = {};
  if (input.name.length < 2 || input.name.length > 120)
    errors.name = "Барааны нэр 2–120 тэмдэгт байна.";
  if (input.description.length > 3000) errors.description = "Тайлбар 3000 тэмдэгтээс хэтрэхгүй.";
  const price = Number(input.price.replace(/[\s,₮]/g, ""));
  if (!Number.isInteger(price) || price < 0 || price > 100_000_000)
    errors.price = "Үнийг төгрөгөөр, бүхэл тоогоор оруулна уу.";
  let original_price: number | null = null;
  if (input.on_sale) {
    const o = Number(input.original_price.replace(/[\s,₮]/g, ""));
    if (!input.original_price || !Number.isInteger(o) || o <= 0 || o > 100_000_000)
      errors.original_price = "Хямдралаас өмнөх үнийг оруулна уу.";
    else if (!errors.price && o <= price)
      errors.original_price = "Анхны үнэ хямдарсан үнээс их байх ёстой.";
    else original_price = o;
  }
  if (!isUuid(input.category_id)) errors.category_id = "Ангилал сонгоно уу.";
  if (!SIZE_OPTIONS.includes(input.size)) errors.size = "Хэмжээ сонгоно уу.";
  if (!CONDITIONS.some((c) => c.value === input.condition))
    errors.condition = "Барааны төлөв сонгоно уу.";

  return {
    errors,
    values: {
      name: input.name,
      description: input.description,
      price,
      original_price,
      category_id: input.category_id,
      size: input.size,
      condition: input.condition as ProductCondition,
      is_available: input.is_available,
    },
  };
}

/** Password rules, shared by the form's live checklist and the server. */
export const PASSWORD_RULES = [
  { id: "length", label: "Хамгийн багадаа 8 тэмдэгт", test: (p: string) => p.length >= 8 },
  { id: "letter", label: "Үсэг (a–z, А–Я)", test: (p: string) => /\p{L}/u.test(p) },
  { id: "number", label: "Тоо (0–9)", test: (p: string) => /\d/.test(p) },
  { id: "symbol", label: "Тэмдэгт (! @ # - + гэх мэт)", test: (p: string) => /[^\p{L}\d\s]/u.test(p) },
] as const;

/** Returns a Mongolian error message, or null when the password is strong enough. */
export function checkPassword(password: string) {
  if (password.length > 72) return "Нууц үг 72 тэмдэгтээс хэтрэхгүй.";
  const missing = PASSWORD_RULES.filter((r) => !r.test(password));
  if (!missing.length) return null;
  return `Нууц үгэнд ${missing.map((r) => r.label.toLowerCase()).join(", ")} байх шаардлагатай.`;
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
