import type { Metadata } from "next";
import Form from "next/form";
import { Suspense } from "react";
import { Search, Store } from "lucide-react";
import { ShopCard } from "@/components/shop/shop-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Container, EmptyState, Skeleton } from "@/components/ui/misc";
import { DISTRICTS } from "@/lib/constants";
import { getShops } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Дэлгүүрүүд",
  description: "Улаанбаатарын second hand, vintage дэлгүүрүүдтэй танилцаж, тэдний барааг үзээрэй.",
  alternates: { canonical: "/shops" },
};

type Params = PageProps<"/shops">["searchParams"];

async function readParams(searchParams: Params) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
  const district = one(sp.district);
  return { q: one(sp.q).slice(0, 80), district: DISTRICTS.includes(district) ? district : "" };
}

export default function ShopsPage({ searchParams }: PageProps<"/shops">) {
  return (
    <Container className="pt-10 pb-20 sm:pt-14">
      <header className="mb-10 border-b border-line pb-8">
        <p className="eyebrow">Дэлгүүрүүд</p>
        <h1 className="mt-3 font-serif font-semibold text-3xl tracking-tight sm:text-4xl">Дэлгүүрүүдтэй танилцах</h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          ThriftUB-д бүртгэлтэй, баталгаажсан second hand болон vintage дэлгүүрүүд.
        </p>
      </header>

      <Suspense fallback={<Skeleton className="mb-10 h-11 w-full max-w-2xl" />}>
        <ShopSearch searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<ShopListSkeleton />}>
        <ShopList searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function ShopSearch({ searchParams }: { searchParams: Params }) {
  const { q, district } = await readParams(searchParams);
  return (
    <Form action="/shops" className="mb-10 flex max-w-2xl flex-col gap-2.5 sm:flex-row" role="search">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-taupe" />
        <label htmlFor="shop-q" className="sr-only">Дэлгүүрийн нэрээр хайх</label>
        <Input id="shop-q" name="q" type="search" defaultValue={q} placeholder="Дэлгүүрийн нэрээр хайх" className="pl-10" />
      </div>
      <label htmlFor="shop-district" className="sr-only">Дүүрэг</label>
      <Select id="shop-district" name="district" defaultValue={district} className="sm:w-52">
        <option value="">Бүх дүүрэг</option>
        {DISTRICTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </Select>
      <Button type="submit">Хайх</Button>
    </Form>
  );
}

async function ShopList({ searchParams }: { searchParams: Params }) {
  const { q, district } = await readParams(searchParams);
  const shops = await getShops({ q, district });

  if (!shops.length) {
    return (
      <EmptyState
        icon={Store}
        title="Дэлгүүр олдсонгүй"
        description="Өөр нэрээр эсвэл өөр дүүргээр хайгаад үзээрэй."
        action={(q || district) && <ButtonLink href="/shops" variant="outline">Бүх дэлгүүрийг харах</ButtonLink>}
      />
    );
  }

  return (
    <>
      <p className="mb-6 text-[13px] text-muted" aria-live="polite">{shops.length} дэлгүүр</p>
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </>
  );
}

function ShopListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/3]" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
