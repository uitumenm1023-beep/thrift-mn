import type { Metadata } from "next";
import Image from "@/components/ui/smart-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Info, MapPin, Phone } from "lucide-react";
import { ProductBrowser, ProductBrowserSkeleton } from "@/components/product/product-browser";
import { ContactButtons } from "@/components/shop/contact-buttons";
import { ShopLogo } from "@/components/shop/shop-card";
import { Container, Skeleton } from "@/components/ui/misc";
import { getShopById, getShopCategories } from "@/lib/data/catalog";
import { parseProductFilters } from "@/lib/filters";
import { formatPhone } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/shops/[id]">): Promise<Metadata> {
  const { id } = await params;
  const shop = await getShopById(id);
  if (!shop) return { title: "Дэлгүүр олдсонгүй" };
  const description =
    shop.description.slice(0, 150) || `${shop.name} — Улаанбаатар дахь second hand дэлгүүр.`;
  return {
    title: shop.name,
    description,
    alternates: { canonical: `/shops/${shop.id}` },
    openGraph: {
      title: shop.name,
      description,
      images: [shop.cover_url ?? shop.logo_url].filter((u): u is string => Boolean(u)),
    },
  };
}

export default function ShopPage({ params, searchParams }: PageProps<"/shops/[id]">) {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopView params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ShopView({ params, searchParams }: PageProps<"/shops/[id]">) {
  const { id } = await params;
  const shop = await getShopById(id);
  if (!shop) notFound();

  return (
    <>
      <div className="relative h-52 bg-paper-deep sm:h-72 lg:h-80">
        {shop.cover_url && (
          <Image src={shop.cover_url} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" />
      </div>

      <Container>
        <div className="relative -mt-12 grid gap-8 border-b border-line pb-10 sm:-mt-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ShopLogo shop={shop} className="size-24 text-3xl sm:size-32 sm:text-4xl" sizes="128px" />
            <p className="eyebrow mt-6">Дэлгүүр{shop.is_demo && " · Демо"}</p>
            <h1 className="mt-2 font-serif font-semibold text-3xl tracking-tight sm:text-4xl">{shop.name}</h1>
            {shop.description && (
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed whitespace-pre-line text-ink-soft">
                {shop.description}
              </p>
            )}
            <ul className="mt-5 space-y-1.5 text-sm text-muted">
              {shop.address && (
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
                  {shop.district && !shop.address.includes(shop.district) ? `${shop.district} дүүрэг, ` : ""}
                  {shop.address}
                </li>
              )}
              {shop.phone && (
                <li className="flex gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} /> {formatPhone(shop.phone)}
                </li>
              )}
            </ul>
          </div>

          <div className="lg:col-span-5 lg:pt-20">
            <p className="mb-3 text-sm text-ink-soft">
              <span className="font-semibold text-ink">{shop.available_count}</span> бараа худалдаанд байна
            </p>
            <ContactButtons shop={shop} />
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
              Үнэ, хэмжээ, хүргэлтийн талаар дэлгүүртэй шууд холбогдож тохиролцоорой.
            </p>
            {shop.is_demo && (
              <p className="mt-3 flex items-center gap-2 text-[12.5px] text-muted">
                <Info className="size-3.5" /> Энэ бол жишээ (демо) дэлгүүр.
              </p>
            )}
          </div>
        </div>

        <Suspense fallback={<Skeleton className="mt-8 h-8 w-full max-w-lg" />}>
          <ShopCategoryChips shopId={shop.id} />
        </Suspense>

        <section className="pt-10 pb-20" aria-labelledby="shop-products">
          <h2 id="shop-products" className="mb-8 font-serif font-semibold tracking-tight text-2xl">Дэлгүүрийн бараа</h2>
          <ProductBrowser
            filters={parseProductFilters(await searchParams)}
            basePath={`/shops/${shop.id}`}
            lockedShopId={shop.id}
          />
        </section>
      </Container>
    </>
  );
}

async function ShopCategoryChips({ shopId }: { shopId: string }) {
  const categories = await getShopCategories(shopId);
  if (!categories.length) return null;
  return (
    <nav aria-label="Дэлгүүрийн ангилал" className="mt-8 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[13px] text-muted">Ангилал:</span>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/shops/${shopId}?category=${c.slug}`}
          scroll={false}
          className="rounded-xl border border-line px-3 py-1.5 text-[13px] transition-colors hover:border-glow hover:text-glow"
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );
}

function ShopSkeleton() {
  return (
    <>
      <Skeleton className="h-52 rounded-none sm:h-72 lg:h-80" />
      <Container className="pb-20">
        <Skeleton className="relative -mt-12 size-24 rounded-full sm:-mt-16 sm:size-32" />
        <Skeleton className="mt-6 h-10 w-72" />
        <Skeleton className="mt-4 h-4 w-full max-w-xl" />
        <div className="mt-16"><ProductBrowserSkeleton /></div>
      </Container>
    </>
  );
}
