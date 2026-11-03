import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { Search, Shirt } from "lucide-react";
import { adminDeleteProduct } from "@/app/admin/actions";
import { ActionButton } from "@/components/dashboard/action-button";
import { PageHeader } from "@/components/dashboard/shell";
import { ShopStatusBadge } from "@/components/dashboard/status-badge";
import { Pagination } from "@/components/product/product-browser";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/misc";
import { getAdminProducts } from "@/lib/data/admin";
import { formatDate, formatPrice } from "@/lib/format";

export const instant = false;

export const metadata = { title: "Бараа" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const q = one(sp.q).trim().slice(0, 80);
  const page = Math.max(1, Math.min(500, Number.parseInt(one(sp.page), 10) || 1));
  const result = await getAdminProducts(q, page);

  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/admin/products${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Бараа" description="Бүх дэлгүүрийн бараа. Дүрэм зөрчсөн барааг устгана." />
      <Form action="/admin/products" className="relative mb-6 max-w-sm" role="search">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-taupe" />
        <label htmlFor="admin-product-q" className="sr-only">Бараа хайх</label>
        <Input id="admin-product-q" name="q" type="search" defaultValue={q} placeholder="Барааны нэрээр хайх" className="h-10 py-2 pl-9" />
      </Form>
      <p className="mb-3 text-[13px] text-muted">{result.total} бараа</p>

      {result.items.length ? (
        <ul className="divide-y divide-line border-y border-line">
          {result.items.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-xl bg-paper-deep">
                  {p.images[0] ? (
                    <Image src={p.images[0].image_url} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <Shirt className="absolute inset-0 m-auto size-5 text-taupe" />
                  )}
                </div>
                <div className="min-w-0">
                  {p.shop.status === "approved" ? (
                    <Link href={`/products/${p.id}`} className="block truncate font-medium hover:underline">{p.name}</Link>
                  ) : (
                    <p className="truncate font-medium">{p.name}</p>
                  )}
                  <p className="mt-0.5 text-[13px] text-muted">
                    {formatPrice(p.price)} · {p.shop.name} · {formatDate(p.created_at)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge tone={p.is_available ? "success" : "neutral"}>{p.is_available ? "Худалдаанд" : "Зарагдсан"}</Badge>
                    {p.shop.status !== "approved" && <ShopStatusBadge status={p.shop.status} />}
                    {p.is_demo && <Badge>Демо</Badge>}
                  </div>
                </div>
              </div>
              <ActionButton action={adminDeleteProduct.bind(null, p.id)} variant="danger" confirm="Бүрмөсөн устгах уу?">
                Устгах
              </ActionButton>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">Бараа олдсонгүй.</p>
      )}
      <Pagination page={result.page} pageCount={result.pageCount} hrefFor={href} />
    </>
  );
}
