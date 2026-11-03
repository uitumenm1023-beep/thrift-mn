import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { Pencil, PackagePlus, Search, Shirt } from "lucide-react";
import { deleteOwnProduct, setProductAvailability } from "@/app/dashboard/actions";
import { ActionButton } from "@/components/dashboard/action-button";
import { PageHeader } from "@/components/dashboard/shell";
import { ShopStatusNotice } from "@/components/dashboard/shop-status-notice";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/misc";
import { CONDITION_LABELS } from "@/lib/constants";
import { getOwnProducts, getOwnShop } from "@/lib/data/owner";
import { cn, formatPrice } from "@/lib/format";

export const instant = false;

export const metadata = { title: "Миний бараа" };

const TABS = [
  { value: "all", label: "Бүгд" },
  { value: "available", label: "Худалдаанд" },
  { value: "sold", label: "Зарагдсан" },
] as const;

export default async function OwnerProductsPage({ searchParams }: PageProps<"/dashboard/products">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const status = TABS.find((t) => t.value === one(sp.status))?.value ?? "all";
  const q = one(sp.q).trim().slice(0, 80);
  const [shop, products] = await Promise.all([getOwnShop(), getOwnProducts(status, q)]);

  const tabHref = (value: string) => {
    const params = new URLSearchParams();
    if (value !== "all") params.set("status", value);
    if (q) params.set("q", q);
    const s = params.toString();
    return `/dashboard/products${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Миний бараа"
        description="Бараагаа засах, зарагдсан гэж тэмдэглэх, устгах."
        action={<ButtonLink href="/dashboard/products/new"><PackagePlus className="size-4" /> Бараа нэмэх</ButtonLink>}
      />
      <ShopStatusNotice shop={shop} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex gap-1" aria-label="Төлөвөөр шүүх">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={tabHref(t.value)}
              aria-current={status === t.value ? "page" : undefined}
              className={cn("rounded-xl px-3 py-1.5 text-sm", status === t.value ? "bg-glow text-night font-medium" : "text-ink-soft hover:bg-ink/8")}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <Form action="/dashboard/products" className="relative sm:w-72" role="search">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-taupe" />
          <label htmlFor="owner-q" className="sr-only">Бараа хайх</label>
          <Input id="owner-q" name="q" type="search" defaultValue={q} placeholder="Нэрээр хайх" className="h-10 py-2 pl-9" />
        </Form>
      </div>

      {products.length ? (
        <ul className="divide-y divide-line border-y border-line">
          {products.map((p) => (
            <li key={p.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl bg-paper-deep">
                  {p.images[0] ? (
                    <Image src={p.images[0].image_url} alt="" fill sizes="64px" className={cn("object-cover", !p.is_available && "opacity-60 grayscale-[40%]")} />
                  ) : (
                    <Shirt className="absolute inset-0 m-auto size-5 text-taupe" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {formatPrice(p.price)} · {p.size} · {CONDITION_LABELS[p.condition]}
                    {p.category && ` · ${p.category.name}`}
                  </p>
                  <div className="mt-1.5 flex gap-1.5">
                    <Badge tone={p.is_available ? "success" : "neutral"}>{p.is_available ? "Худалдаанд" : "Зарагдсан"}</Badge>
                    {p.is_demo && <Badge>Демо</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-start gap-2 sm:justify-end">
                <ActionButton action={setProductAvailability.bind(null, p.id, !p.is_available)}>
                  {p.is_available ? "Зарагдсан гэж тэмдэглэх" : "Худалдаанд гаргах"}
                </ActionButton>
                <Link href={`/dashboard/products/${p.id}/edit`} className={buttonClasses("ghost", "sm")}>
                  <Pencil className="size-3.5" /> Засах
                </Link>
                <ActionButton action={deleteOwnProduct.bind(null, p.id)} variant="danger" confirm="Устгах уу?">
                  Устгах
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center">
          <p className="font-serif font-semibold tracking-tight text-lg">{q || status !== "all" ? "Тохирох бараа олдсонгүй" : "Одоогоор бараа алга"}</p>
          <ButtonLink href={q || status !== "all" ? "/dashboard/products" : "/dashboard/products/new"} variant="outline" className="mt-5">
            {q || status !== "all" ? "Бүх барааг харах" : "Анхны бараагаа нэмэх"}
          </ButtonLink>
        </div>
      )}
    </>
  );
}
