import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductBrowser, ProductBrowserSkeleton } from "@/components/product/product-browser";
import { Container } from "@/components/ui/misc";
import { getCategories } from "@/lib/data/catalog";
import { parseProductFilters } from "@/lib/filters";

export async function generateMetadata({ searchParams }: PageProps<"/products">): Promise<Metadata> {
  const filters = parseProductFilters(await searchParams);
  const category = filters.category
    ? (await getCategories()).find((c) => c.slug === filters.category)
    : undefined;
  const title = filters.q ? `“${filters.q}” хайлтын үр дүн` : category ? category.name : "Бүх бараа";
  return {
    title,
    description: `Улаанбаатарын second hand дэлгүүрүүдийн ${category ? category.name.toLowerCase() : "хувцас"} — үнэ, хэмжээ, төлвөөр шүүж хайгаарай.`,
    alternates: { canonical: category ? `/products?category=${category.slug}` : "/products" },
  };
}

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <Container className="pt-10 pb-20 sm:pt-14">
      <header className="mb-10 border-b border-line pb-8">
        <p className="eyebrow">Каталог</p>
        <h1 className="mt-3 font-serif font-semibold text-3xl tracking-tight sm:text-4xl">Бүх бараа</h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          Улаанбаатарын second hand, vintage дэлгүүрүүдийн худалдаанд байгаа бараа.
        </p>
      </header>
      <Suspense fallback={<ProductBrowserSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/products">, "searchParams">) {
  const filters = parseProductFilters(await searchParams);
  return <ProductBrowser filters={filters} />;
}
