import Link from "next/link";
import { AdminShopRow } from "@/components/dashboard/admin-shop-row";
import { PageHeader, StatCard } from "@/components/dashboard/shell";
import { getAdminShops, getAdminStats } from "@/lib/data/admin";

export const instant = false;

export const metadata = { title: "Тойм" };

export default async function AdminHome() {
  const [stats, pending] = await Promise.all([getAdminStats(), getAdminShops("pending")]);
  return (
    <>
      <PageHeader title="Админы самбар" description="Дэлгүүрүүдийг баталгаажуулж, контентыг хянана." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Хүлээгдэж буй дэлгүүр" value={stats.pending} hint={<Link href="/admin/shops?status=pending" className="underline underline-offset-2">Шалгах</Link>} />
        <StatCard label="Баталгаажсан дэлгүүр" value={stats.approved} hint={`Нийт ${stats.shops} · Түр хаасан ${stats.suspended}`} />
        <StatCard label="Нийт бараа" value={stats.products} hint={`${stats.available} нь худалдаанд`} />
        <StatCard label="Дэлгүүр эзэмшигч" value={stats.owners} />
      </div>

      <section className="mt-12">
        <h2 className="mb-2 font-serif font-semibold tracking-tight text-xl">Шалгах хүсэлтүүд</h2>
        {pending.length ? (
          <ul className="divide-y divide-line border-y border-line">
            {pending.map((shop) => <AdminShopRow key={shop.id} shop={shop} />)}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
            Шалгах хүсэлт алга байна.
          </p>
        )}
      </section>
    </>
  );
}
