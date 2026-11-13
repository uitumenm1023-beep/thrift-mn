import { notFound } from "next/navigation";
import { ProductForm } from "@/components/forms/product-form";
import { PageHeader } from "@/components/dashboard/shell";
import { getCategoriesLive } from "@/lib/data/categories-live";
import { getCurrentUser, getOwnProduct } from "@/lib/data/owner";
import { isUuid } from "@/lib/validation";

export const instant = false;

export const metadata = { title: "Бараа засах" };

export default async function EditProductPage({ params }: PageProps<"/dashboard/products/[id]/edit">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [user, product, categories] = await Promise.all([getCurrentUser(), getOwnProduct(id), getCategoriesLive()]);
  if (!product || !user) notFound();

  return (
    <>
      <PageHeader title="Бараа засах" description={product.name} />
      <ProductForm
        userId={user.id}
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          original_price: product.original_price,
          category_id: product.category_id ?? "",
          size: product.size,
          condition: product.condition,
          is_available: product.is_available,
          images: product.images.map((i) => i.image_url),
        }}
      />
    </>
  );
}
