import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import { AdminShopRow } from "@/components/dashboard/admin-shop-row";
import { PageHeader } from "@/components/dashboard/shell";
import { Input } from "@/components/ui/field";
import { SHOP_STATUS_LABELS } from "@/lib/constants";
import { getAdminShops } from "@/lib/data/admin";
import { cn } from "@/lib/format";
import type { ShopStatus } from "@/lib/types";

export const instant = false;

export const metadata = { title: "Дэлгүүрүүд" };

const TABS: { value: ShopStatus | ""; label: string }[] = [
  { value: "", label: "Бүгд" },
  ...(Object.entries(SHOP_STATUS_LABELS) as [ShopStatus, string][]).map(([value, label]) => ({ value, label })),
];

export default async function AdminShopsPage({ searchParams }: PageProps<"/admin/shops">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const status = TABS.find((t) => t.value && t.value === one(sp.status))?.value || undefined;
  const q = one(sp.q).trim().slice(0, 80);
  const shops = await getAdminShops(status, q);

  const href = (value: string) => {
    const p = new URLSearchParams();
    if (value) p.set("status", value);
    if (q) p.set("q", q);
    const s = p.toString();
    return `/admin/shops${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Дэлгүүрүүд" description="Шинэ дэлгүүрийг баталгаажуулах, татгалзах, түр хаах." />
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="flex flex-wrap gap-1" aria-label="Төлөвөөр шүүх">
          {TABS.map((t) => (
            <Link key={t.value || "all"} href={href(t.value)} aria-current={(status ?? "") === t.value ? "page" : undefined}
              className={cn("rounded-xl px-3 py-1.5 text-sm", (status ?? "") === t.value ? "bg-glow text-night font-medium" : "text-ink-soft hover:bg-ink/8")}>
              {t.label}
            </Link>
          ))}
        </nav>
        <Form action="/admin/shops" className="relative lg:w-72" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-taupe" />
          <label htmlFor="admin-shop-q" className="sr-only">Дэлгүүр хайх</label>
          <Input id="admin-shop-q" name="q" type="search" defaultValue={q} placeholder="Нэрээр хайх" className="h-10 py-2 pl-9" />
        </Form>
      </div>
      {shops.length ? (
        <ul className="divide-y divide-line border-y border-line">
          {shops.map((shop) => <AdminShopRow key={shop.id} shop={shop} />)}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">Дэлгүүр олдсонгүй.</p>
      )}
    </>
  );
}
