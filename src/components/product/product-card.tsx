import Image from "@/components/ui/smart-image";
import Link from "next/link";
import { Shirt } from "lucide-react";
import { CONDITION_LABELS } from "@/lib/constants";
import { discountPercent, formatPrice } from "@/lib/format";
import type { ProductCardData } from "@/lib/types";

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const sold = !product.is_available;
  const off = discountPercent(product.price, product.original_price);

  return (
    <article className="group relative">
      <Link href={`/products/${product.id}`} className="block" aria-label={product.name}>
        <div className="shimmer relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-line transition-shadow duration-500 group-hover:ring-glow/40">
          {product.image_url ? (
            <Image
              thumb
              src={product.image_url}
              alt={product.name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className={`object-cover transition-transform duration-[900ms] ease-(--ease-soft) group-hover:scale-[1.04] ${sold ? "opacity-50 grayscale" : ""}`}
            />
          ) : (
            <div className="grid size-full place-items-center">
              <Shirt className="size-10 text-taupe/60" strokeWidth={1} />
            </div>
          )}

          <div className="absolute top-3 left-3 flex gap-1.5">
            {off && !sold && (
              <span className="rounded-full bg-glow px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide text-night shadow-[0_4px_16px_-4px_rgb(0_0_0/0.5)]">
                -{off}%
              </span>
            )}
            {sold && (
              <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.12em] text-night uppercase">
                Зарагдсан
              </span>
            )}
            {product.is_demo && (
              <span className="rounded-full bg-night/70 px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.12em] text-ink-soft uppercase backdrop-blur">
                Демо
              </span>
            )}
          </div>
        </div>

        <div className="mt-3.5 space-y-1">
          <p className="eyebrow truncate !text-[10px]">{product.shop.name}</p>
          <h3 className="line-clamp-1 text-[15px] leading-snug font-medium text-ink transition-colors group-hover:text-glow">
            {product.name}
          </h3>
          <div className="flex items-baseline justify-between gap-2">
            <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 font-mono text-[14px] font-medium text-glow">
              {formatPrice(product.price)}
              {off && <span className="text-[12px] font-normal text-muted line-through">{formatPrice(product.original_price!)}</span>}
            </p>
            <p className="truncate text-[12px] text-muted">
              {product.size} · {CONDITION_LABELS[product.condition]}
            </p>
          </div>
          <p className="flex items-center gap-1.5 text-[12px] text-muted">
            <span className={`size-1.5 rounded-full ${sold ? "bg-taupe" : "bg-success"}`} aria-hidden="true" />
            {sold ? "Зарагдсан" : "Худалдаанд байгаа"}
          </p>
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: ProductCardData[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Ачаалж байна">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-paper-deep" />
          <div className="mt-3.5 h-2.5 w-16 animate-pulse rounded-xl bg-paper-deep" />
          <div className="mt-2 h-3.5 w-3/4 animate-pulse rounded-xl bg-paper-deep" />
          <div className="mt-2 h-3.5 w-1/3 animate-pulse rounded-xl bg-paper-deep" />
        </div>
      ))}
    </div>
  );
}
