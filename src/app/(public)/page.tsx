import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { CategoryGrid } from "@/components/home/category-grid";
import { Hero } from "@/components/home/hero";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-card";
import { ShopCard } from "@/components/shop/shop-card";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading, Skeleton } from "@/components/ui/misc";
import { getCategories, getLatestProducts, getPopularShops } from "@/lib/data/catalog";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Шинээр ирсэн"
            title="Сүүлд нэмэгдсэн бараа"
            action={<SeeAll href="/products">Бүгдийг үзэх</SeeAll>}
          />
          <Suspense fallback={<ProductGridSkeleton />}>
            <LatestProducts />
          </Suspense>
        </Container>
      </section>

      <section className="bg-paper-deep/60 py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Дэлгүүрүүд"
            title="Онцлох дэлгүүрүүд"
            action={<SeeAll href="/shops">Бүх дэлгүүр</SeeAll>}
          />
          <Suspense fallback={<CardsSkeleton count={4} />}>
            <PopularShops />
          </Suspense>
        </Container>
      </section>

      <section id="categories" className="py-16 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Ангилал" title="Ангиллаар хайх" />
          <Suspense fallback={<CardsSkeleton count={8} />}>
            <Categories />
          </Suspense>
        </Container>
      </section>

      <HowItWorks />
    </>
  );
}

function SeeAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 border-b border-ink/30 pb-0.5 text-sm font-medium transition-colors hover:border-glow hover:text-glow">
      {children}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

async function LatestProducts() {
  const products = await getLatestProducts(8);
  if (!products.length) {
    return <p className="py-10 text-center text-muted">Одоогоор бараа нэмэгдээгүй байна. Удахгүй!</p>;
  }
  return <ProductGrid products={products} />;
}

async function PopularShops() {
  const shops = await getPopularShops(4);
  if (!shops.length) {
    return <p className="py-10 text-center text-muted">Баталгаажсан дэлгүүр одоогоор алга.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {shops.map((s) => (
        <ShopCard key={s.id} shop={s} />
      ))}
    </div>
  );
}

async function Categories() {
  const categories = await getCategories();
  return <CategoryGrid categories={categories} />;
}

function CardsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="aspect-[3/4]" />
      ))}
    </div>
  );
}

const STEPS = [
  { title: "Дэлгүүрээ сонго", text: "Улаанбаатарын баталгаажсан second hand, vintage дэлгүүрүүдээс сонголтоо хий." },
  { title: "Хувцсаа ол", text: "Ангилал, үнэ, хэмжээ, төлвөөр шүүж яг хүссэн хувцсаа хурдан олоорой." },
  { title: "Дэлгүүртэй холбогд", text: "Instagram, Facebook эсвэл утсаар дэлгүүртэй шууд холбогдож, худалдан аваарай." },
];

function HowItWorks() {
  return (
    <section className="border-t border-line py-16 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-3">Хэрхэн ажилладаг вэ</p>
          <h2 className="font-serif font-semibold tracking-tight text-2xl leading-tight sm:text-3xl">Гурван алхамаар хүссэн хувцсаа ол.</h2>
          <p className="mt-4 max-w-sm text-[15px] text-muted">
            ThriftUB төлбөр авдаггүй, хүргэлт хийдэггүй. Худалдан авалтыг та дэлгүүртэйгээ шууд тохирно.
          </p>
          <ButtonLink href="/register-shop" variant="outline" className="mt-8">
            Дэлгүүрээ бүртгүүлэх
          </ButtonLink>
        </div>
        <ol className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t border-glow/50 pt-6">
              <span className="font-serif font-semibold tracking-tight text-4xl text-taupe/70">0{i + 1}</span>
              <h3 className="mt-5 text-lg font-medium">{step.title}.</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
