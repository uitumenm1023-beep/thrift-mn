import { CategoryRow } from "@/components/dashboard/category-row";
import { PageHeader } from "@/components/dashboard/shell";
import { CategoryForm } from "@/components/forms/category-form";
import { getCategoriesLive } from "@/lib/data/categories-live";

export const instant = false;

export const metadata = { title: "Ангилал" };

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesLive();
  return (
    <>
      <PageHeader title="Ангилал" description="Барааны ангиллыг нэмэх, засах, устгах." />
      <ul className="divide-y divide-line border-y border-line">
        {categories.map((c) => <CategoryRow key={c.id} category={c} />)}
      </ul>
      <section className="mt-10 max-w-3xl rounded-xl border border-line bg-paper-deep p-6">
        <h2 className="mb-4 font-serif font-semibold tracking-tight text-xl">Шинэ ангилал</h2>
        <CategoryForm />
      </section>
    </>
  );
}
