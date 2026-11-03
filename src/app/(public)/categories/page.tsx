import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryGrid } from "@/components/home/category-grid";
import { Container, Skeleton } from "@/components/ui/misc";
import { getCategories } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Ангилал",
  description: "Эрэгтэй, эмэгтэй хувцас, гадуур хувцас, гутал, цүнх болон бусад ангиллаар second hand бараа хайх.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <Container className="pt-10 pb-20 sm:pt-14">
      <header className="mb-10 border-b border-line pb-8">
        <p className="eyebrow">Ангилал</p>
        <h1 className="mt-3 font-serif font-semibold text-3xl tracking-tight sm:text-4xl">Ангиллаар хайх</h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">Хайж буй зүйлээ ангиллаар нь шүүж үзээрэй.</p>
      </header>
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="aspect-[4/5] md:aspect-[3/4]" />)}
          </div>
        }
      >
        <Categories />
      </Suspense>
    </Container>
  );
}

async function Categories() {
  return <CategoryGrid categories={await getCategories()} />;
}
