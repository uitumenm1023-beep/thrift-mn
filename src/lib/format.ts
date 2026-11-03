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
