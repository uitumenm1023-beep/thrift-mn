import { ProductForm } from "@/components/forms/product-form";
import { PageHeader } from "@/components/dashboard/shell";
import { ShopStatusNotice } from "@/components/dashboard/shop-status-notice";
import { getCategoriesLive } from "@/lib/data/categories-live";
import { getCurrentUser, getOwnShop } from "@/lib/data/owner";

export const instant = false;

export const metadata = { title: "Бараа нэмэх" };

export default async function NewProductPage() {
  const [user, shop, categories] = await Promise.all([getCurrentUser(), getOwnShop(), getCategoriesLive()]);
  return (
    <>
      <PageHeader title="Бараа нэмэх" description="Сайн зураг, тодорхой тайлбар худалдан авагчдыг татна." />
      <ShopStatusNotice shop={shop} />
      {shop && user && <ProductForm userId={user.id} categories={categories} />}
    </>
  );
}
