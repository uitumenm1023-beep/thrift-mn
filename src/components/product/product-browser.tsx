import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX, X } from "lucide-react";
import { ProductGrid } from "@/components/product/product-card";
import { ProductFilterPanel, ProductToolbar } from "@/components/product/product-filters";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { CONDITION_LABELS } from "@/lib/constants";
import { getCategories, getProducts, getShops } from "@/lib/data/catalog";
import { filtersToQuery, type ProductFilters } from "@/lib/filters";
import { cn, formatPrice } from "@/lib/format";

interface Props {
  filters: ProductFilters;
  basePath?: string;
  /** When browsing inside a single shop's page */
  lockedShopId?: string;
}

/** Filter sidebar + search/sort toolbar + product grid + pagination. */
export async function ProductBrowser({ filters, basePath = "/products", lockedShopId }: Props) {
  const effective = lockedShopId ? { ...filters, shop: lockedShopId } : filters;
  const [result, categories, shops] = await Promise.all([
    getProducts(effective),
    getCategories(),
    lockedShopId ? Promise.resolve([]) : getShops(),
  ]);

  const href = (patch: Partial<ProductFilters>) =>
    `${basePath}${filtersToQuery({ ...filters, page: 1, ...patch, ...(lockedShopId ? { shop: "" } : {}) })}`;

  const chips: { label: string; href: string }[] = [];
  const cat = categories.find((c) => c.slug === filters.category);
  if (cat) chips.push({ label: cat.name, href: href({ category: "" }) });
  if (filters.minPrice != null || filters.maxPrice != null)
    chips.push({
      label: `${filters.minPrice != null ? formatPrice(filters.minPrice) : "0₮"} – ${filters.maxPrice != null ? formatPrice(filters.maxPrice) : "∞"}`,
      href: href({ minPrice: null, maxPrice: null }),
    });
  filters.sizes.forEach((s) => chips.push({ label: `Хэмжээ: ${s}`, href: href({ sizes: filters.sizes.filter((x) => x !== s) }) }));
  filters.conditions.forEach((c) =>
    chips.push({ label: CONDITION_LABELS[c], href: href({ conditions: filters.conditions.filter((x) => x !== c) }) }),
  );
  filters.districts.forEach((d) =>
    chips.push({
      label: filters.near ? `Ойролцоо: ${d}` : `Дүүрэг: ${d}`,
      href: href({ districts: filters.districts.filter((x) => x !== d), near: false }),
    }),
  );
  const shop = !lockedShopId && shops.find((s) => s.id === filters.shop);
  if (shop) chips.push({ label: shop.name, href: href({ shop: "" }) });
  if (filters.onSale) chips.push({ label: "Хямдралтай", href: href({ onSale: false }) });
  if (filters.includeSold) chips.push({ label: "Зарагдсан бараа орсон", href: href({ includeSold: false }) });

  return (
    <div className="lg:grid lg:grid-cols-[230px_1fr] lg:gap-12 xl:gap-16">
      <div className="mb-4 lg:mb-0">
        <div className="lg:sticky lg:top-28">
          <ProductFilterPanel
            filters={lockedShopId ? { ...filters, shop: "" } : filters}
            basePath={basePath}
            hideShop={Boolean(lockedShopId)}
            categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
            shops={shops.map((s) => ({ value: s.id, label: s.name }))}
          />
        </div>
      </div>

      <div className="min-w-0">
        <ProductToolbar filters={filters} basePath={basePath} />

        <div className="mt-5 mb-8 flex flex-wrap items-center gap-2">
          <p className="mr-2 text-[13px] text-muted" aria-live="polite">
            {result.total} бараа олдлоо
            {filters.q && (
              <>
                {" "}· “<span className="text-ink">{filters.q}</span>”
              </>
            )}
          </p>
          {chips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              scroll={false}
              className="inline-flex items-center gap-1 rounded-xl bg-paper-deep px-2.5 py-1 text-[12.5px] text-ink-soft transition-colors hover:bg-sand"
            >
              {chip.label}
              <X className="size-3" aria-label="Арилгах" />
            </Link>
          ))}
        </div>

        {result.items.length ? (
          <>
            <ProductGrid products={result.items} priorityCount={4} />
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              hrefFor={(page) => `${basePath}${filtersToQuery({ ...filters, page, ...(lockedShopId ? { shop: "" } : {}) })}`}
            />
          </>
        ) : (
          <EmptyState
            icon={SearchX}
            title="Тохирох бараа олдсонгүй"
            description="Шүүлтүүрээ өөрчлөх эсвэл өөр үгээр хайгаад үзээрэй."
            action={
              <ButtonLink href={basePath} variant="outline">
                Бүх барааг харах
              </ButtonLink>
            }
          />
        )}
      </div>
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  // 1 … 4 5 [6] 7 8 … 20
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const base = "grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm transition-colors";

  return (
    <nav className="mt-16 flex items-center justify-center gap-1" aria-label="Хуудаслалт">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(base, "hover:bg-ink/8")} aria-label="Өмнөх хуудас">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, "opacity-30")} aria-hidden="true"><ChevronLeft className="size-4" /></span>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-muted">…</span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(base, p === page ? "bg-glow text-night font-medium" : "hover:bg-ink/8")}
          >
            {p}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={cn(base, "hover:bg-ink/8")} aria-label="Дараагийн хуудас">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, "opacity-30")} aria-hidden="true"><ChevronRight className="size-4" /></span>
      )}
    </nav>
  );
}

export function ProductBrowserSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[230px_1fr] lg:gap-12 xl:gap-16">
      <div className="hidden space-y-4 lg:block">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-4 w-3/4 animate-pulse rounded-xl bg-paper-deep" />
        ))}
      </div>
      <div>
        <div className="h-11 animate-pulse rounded-xl bg-paper-deep" />
        <div className="mt-5 mb-8 h-4 w-32 animate-pulse rounded-xl bg-paper-deep" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-paper-deep" />
          ))}
        </div>
      </div>
    </div>
  );
}
