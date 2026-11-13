import type { Shop } from "./types";


/** 125000 → "125,000₮" */
export function formatPrice(value: number) {
  return `${Math.round(value).toLocaleString("en-US")}₮`;
}

/** Turns "9911 0001" or "+976 99110001" into a tel: link. */
export function phoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return null;
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.length === 8) return `tel:+976${digits}`;
  return `tel:${digits}`;
}

/** "99110001" → "9911 0001" */
export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return phone;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** True when a shop's address is actually a map link (e.g. maps.app.goo.gl/...). */
export function isMapLink(address: string) {
  return /^https?:\/\//i.test(address.trim());
}

/** 100,000 → 70,000 = 30. Null when the product is not on sale. */
export function discountPercent(price: number, original: number | null | undefined) {
  if (!original || original <= price) return null;
  return Math.max(1, Math.round((1 - price / original) * 100));
}

/** The shop's current package: label, limit (0 once expired) and days left. */
export function planState(shop: Pick<Shop, "plan" | "plan_expires_at">, now = Date.now()) {
  const expiresAt = shop.plan_expires_at ? new Date(shop.plan_expires_at) : null;
  const expired = expiresAt ? expiresAt.getTime() < now : false;
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - now) / 86_400_000)) : null;
  return { plan: shop.plan, expiresAt, expired, daysLeft };
}
