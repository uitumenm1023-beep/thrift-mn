"use client";

import Image from "@/components/ui/smart-image";
import { useState } from "react";
import { Pencil, Tag } from "lucide-react";
import { deleteCategory } from "@/app/admin/actions";
import { ActionButton } from "@/components/dashboard/action-button";
import { CategoryForm } from "@/components/forms/category-form";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-paper-deep">
          {category.image_url ? (
            <Image src={category.image_url} alt="" fill sizes="48px" className="object-cover" />
          ) : (
            <Tag className="size-4 text-taupe" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{category.name}</p>
          <p className="text-[13px] text-muted">/{category.slug} · дараалал {category.sort_order}</p>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
            <Pencil className="size-3.5" /> {editing ? "Хаах" : "Засах"}
          </Button>
          <ActionButton action={deleteCategory.bind(null, category.id)} variant="danger" confirm="Устгах уу? Бараанууд ангилалгүй болно.">
            Устгах
          </ActionButton>
        </div>
      </div>
      {editing && (
        <div className="mt-4 rounded-xl border border-line bg-paper-deep p-5">
          <CategoryForm category={category} />
        </div>
      )}
    </li>
  );
}
