import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRight, Info, MapPin, Phone } from "lucide-react";
import { ProductGrid } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ContactButtons } from "@/components/shop/contact-buttons";
import { ShopLogo } from "@/components/shop/shop-card";
import { Container, Skeleton } from "@/components/ui/misc";
import { CONDITION_LABELS } from "@/lib/constants";
import { getMoreFromShop, getProductById } from "@/lib/data/catalog";
import { discountPercent, formatPhone, formatPrice, isMapLink } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Бараа олдсонгүй" };

  const off = discountPercent(product.price, product.original_price);
  const description =
    `${formatPrice(product.price)}${off ? ` (-${off}%, өмнө нь ${formatPrice(product.original_price!)})` : ""} · ${product.size} · ${CONDITION_LABELS[product.condition]} — ${product.shop.name}. ` +
    product.description.slice(0, 120);
  return {
    title: `${product.name} — ${formatPrice(product.price)}`,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      title: product.name,
      description,
      images: product.images.slice(0, 1).map((i) => ({ url: i.image_url, alt: product.name })),
    },
  };
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetailView params={params} />
    </Suspense>
  );
}

async function ProductDetailView({ params }: Pick<PageProps<"/products/[id]">, "params">) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const { shop } = product;
  const sold = !product.is_available;
  const off = discountPercent(product.price, product.original_price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.image_url),
    itemCondition: product.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "MNT",
      availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStoreOnly",
      seller: { "@type": "Organization", name: shop.name },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Container className="pt-6 pb-20 sm:pt-10">
        <nav aria-label="Замын мөр" className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
          <Link href="/" className="hover:text-ink">Нүүр</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-ink">Бүх бараа</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="line-clamp-1 text-ink-soft">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images.map((i) => i.image_url)} alt={product.name} dimmed={sold} />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Link href={`/shops/${shop.id}`} className="eyebrow hover:!text-ink">{shop.name}</Link>
              <h1 className="mt-3 font-serif font-semibold text-2xl leading-tight tracking-tight sm:text-3xl">{product.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-mono text-2xl font-medium text-glow">{formatPrice(product.price)}</p>
                {off && (
                  <>
                    <p className="font-mono text-lg text-muted line-through decoration-rust/80">{formatPrice(product.original_price!)}</p>
                    <span className="rounded-full bg-glow px-2.5 py-1 font-mono text-[12px] font-medium text-night">-{off}% хямдрал</span>
                  </>
                )}
              </div>

              <p className="mt-3 flex items-center gap-2 text-sm">
                <span className={`size-2 rounded-full ${sold ? "bg-taupe" : "bg-success"}`} aria-hidden="true" />
                {sold ? "Зарагдсан" : "Худалдаанд байгаа"}
              </p>

              <dl className="mt-8 grid grid-cols-3 border-y border-line py-5 text-sm">
                <div>
                  <dt className="eyebrow !text-[10px]">Хэмжээ</dt>
                  <dd className="mt-1.5 font-medium">{product.size || "—"}</dd>
                </div>
                <div>
                  <dt className="eyebrow !text-[10px]">Төлөв</dt>
                  <dd className="mt-1.5 font-medium">{CONDITION_LABELS[product.condition]}</dd>
                </div>
                <div>
                  <dt className="eyebrow !text-[10px]">Ангилал</dt>
                  <dd className="mt-1.5 font-medium">{product.category?.name ?? "—"}</dd>
                </div>
              </dl>

              {sold && (
                <p className="mt-6 rounded-xl bg-paper-deep px-4 py-3 text-sm text-ink-soft">
                  Энэ бараа зарагдсан байна. Дэлгүүртэй холбогдож төстэй бараа байгаа эсэхийг асуугаарай.
                </p>
              )}

              <div className="mt-6">
                <ContactButtons shop={shop} />
                <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                  ThriftUB төлбөр авдаггүй. Худалдан авалт, хүргэлтийн нөхцөлөө дэлгүүртэй шууд тохиролцоорой.
                </p>
              </div>

              {product.description && (
                <div className="mt-8">
                  <h2 className="eyebrow !text-ink">Тайлбар</h2>
                  <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-ink-soft">{product.description}</p>
                </div>
              )}

              <Link href={`/shops/${shop.id}`} className="group mt-8 flex items-start gap-4 rounded-xl bg-paper-deep/70 p-5 transition-colors hover:bg-paper-deep">
                <ShopLogo shop={shop} className="size-12 text-base ring-0" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 font-serif font-semibold tracking-tight text-base">
                    {shop.name}
                    <ArrowUpRight className="size-4 text-taupe transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </p>
                  {shop.address && (
                    <p className="mt-1 flex gap-1.5 text-[13px] text-muted">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" /> {isMapLink(shop.address) ? "Газрын зураг дээр байршилтай" : shop.address}
                    </p>
                  )}
                  {shop.phone && (
                    <p className="mt-1 flex gap-1.5 text-[13px] text-muted">
                      <Phone className="mt-0.5 size-3.5 shrink-0" /> {formatPhone(shop.phone)}
                    </p>
                  )}
                </div>
              </Link>

              {product.is_demo && (
                <p className="mt-4 flex items-center gap-2 text-[12.5px] text-muted">
                  <Info className="size-3.5" /> Энэ бол жишээ (демо) бараа.
                </p>
              )}
            </div>
          </div>
        </div>

        <Suspense fallback={null}>
          <MoreFromShop shopId={shop.id} shopName={shop.name} productId={product.id} />
        </Suspense>
      </Container>
    </>
  );
}

async function MoreFromShop({ shopId, shopName, productId }: { shopId: string; shopName: string; productId: string }) {
  const products = await getMoreFromShop(shopId, productId, 4);
  if (!products.length) return null;
  return (
    <section className="mt-24 border-t border-line pt-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{shopName}</p>
          <h2 className="font-serif font-semibold tracking-tight text-2xl">Энэ дэлгүүрийн бусад бараа</h2>
        </div>
        <Link href={`/shops/${shopId}`} className="shrink-0 border-b border-ink/30 pb-0.5 text-sm font-medium hover:border-glow hover:text-glow">
          Бүгдийг үзэх
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}

function ProductSkeleton() {
  return (
    <Container className="pt-6 pb-20 sm:pt-10">
      <Skeleton className="mb-6 h-4 w-60" />
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <Skeleton className="aspect-[4/5] lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-8 h-20 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </Container>
  );
}
