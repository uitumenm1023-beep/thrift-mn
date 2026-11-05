import { ProductForm } from "@/components/forms/product-form";
import { PageHeader } from "@/components/dashboard/shell";
import { ShopStatusNotice } from "@/components/dashboard/shop-status-notice";
import { getCategoriesLive } from "@/lib/data/categories-live";
import { PlanCard } from "@/components/dashboard/plan-card";
import { PLANS } from "@/lib/constants";
import { getCurrentUser, getOwnShop, getOwnStats } from "@/lib/data/owner";
import { planState } from "@/lib/format";

export const instant = false;

export const metadata = { title: "Бараа нэмэх" };

export default async function NewProductPage() {
  const [user, shop, categories, stats] = await Promise.all([getCurrentUser(), getOwnShop(), getCategoriesLive(), getOwnStats()]);
  const limit = shop ? (planState(shop).expired ? 0 : PLANS[shop.plan].limit) : null;
  const full = limit !== null && stats.available >= limit;
  return (
    <>
      <PageHeader title="Бараа нэмэх" description="Сайн зураг, тодорхой тайлбар худалдан авагчдыг татна." />
      <ShopStatusNotice shop={shop} />
      {shop && full && <PlanCard shop={shop} available={stats.available} />}
      {shop && user && !full && <ProductForm userId={user.id} categories={categories} />}
    </>
  );
}
