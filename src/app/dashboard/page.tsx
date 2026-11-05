import Image from "@/components/ui/smart-image";
import Link from "next/link";
import { ArrowUpRight, PackagePlus, Shirt } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/shell";
import { PlanCard } from "@/components/dashboard/plan-card";
import { ShopStatusNotice } from "@/components/dashboard/shop-status-notice";
import { ButtonLink } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/field";
import { getCurrentUser, getOwnProducts, getOwnShop, getOwnStats } from "@/lib/data/owner";
import { formatPrice } from "@/lib/format";

export const instant = false;

export const metadata = { title: "Тойм" };

export default async function DashboardHome({ searchParams }: PageProps<"/dashboard">) {
  const [user, shop, stats, products, sp] = await Promise.all([
    getCurrentUser(),
    getOwnShop(),
    getOwnStats(),
    getOwnProducts(),
    searchParams,
  ]);
  const recent = products.slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Сайн байна уу${user?.profile.full_name ? `, ${user.profile.full_name.split(" ")[0]}` : ""}`}
        description="Дэлгүүрийнхээ бараа, мэдээллийг эндээс удирдана."
        action={
          <ButtonLink href="/dashboard/products/new">
            <PackagePlus className="size-4" /> Бараа нэмэх
          </ButtonLink>
        }
      />

      {sp.welcome === "1" && (
        <div className="mb-6">
          <FormMessage type="success">Бүртгэл амжилттай үүслээ! Одоо бараагаа нэмж эхлээрэй.</FormMessage>
        </div>
      )}
      <ShopStatusNotice shop={shop} />
      {shop && <PlanCard shop={shop} available={stats.available} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Нийт бараа" value={stats.total} />
        <StatCard label="Худалдаанд байгаа" value={stats.available} />
        <StatCard label="Зарагдсан" value={stats.sold} />
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif font-semibold tracking-tight text-xl">Сүүлд нэмсэн бараа</h2>
          {products.length > 0 && (
            <Link href="/dashboard/products" className="border-b border-ink/30 pb-0.5 text-sm font-medium hover:border-glow hover:text-glow">Бүгдийг харах</Link>
          )}
        </div>
        {recent.length ? (
          <ul className="divide-y divide-line border-y border-line">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/products/${p.id}/edit`} className="flex items-center gap-4 py-3 hover:bg-ink/[0.04]">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-paper-deep">
                    {p.images[0] ? (
                      <Image thumb src={p.images[0].image_url} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <Shirt className="m-auto mt-4 size-5 text-taupe" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-[13px] text-muted">{formatPrice(p.price)} · {p.size}</p>
                  </div>
                  <span className={`text-[12px] ${p.is_available ? "text-success" : "text-muted"}`}>
                    {p.is_available ? "Худалдаанд" : "Зарагдсан"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center">
            <p className="font-serif font-semibold tracking-tight text-lg">Одоогоор бараа алга</p>
            <p className="mt-1 text-sm text-muted">Анхны бараагаа нэмж, зургаа оруулаарай.</p>
            <ButtonLink href="/dashboard/products/new" variant="outline" className="mt-5">Бараа нэмэх</ButtonLink>
          </div>
        )}
      </section>

      {shop?.status === "approved" && (
        <Link href={`/shops/${shop.id}`} className="mt-10 inline-flex items-center gap-1.5 border-b border-ink/30 pb-0.5 text-sm font-medium hover:border-glow hover:text-glow">
          Дэлгүүрийн нийтийн хуудсыг үзэх <ArrowUpRight className="size-3.5" />
        </Link>
      )}
    </>
  );
}
