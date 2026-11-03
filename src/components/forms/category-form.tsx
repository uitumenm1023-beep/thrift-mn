"use client";

import { useActionState, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { saveCategory } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { errorProps, Field, FormMessage, Input } from "@/components/ui/field";
import { formValues } from "@/lib/form-values";
import type { ActionResult, Category } from "@/lib/types";

/** Create (no `category`) or edit a category. */
export function CategoryForm({ category, onDone }: { category?: Category; onDone?: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(async (prev, formData) => {
    const result = await saveCategory(prev, formData);
    // Keep typed values on error; clear the "new" form on success.
    setValues(result.ok ? {} : formValues(formData));
    if (result.ok) onDone?.();
    return result;
  }, null);

  const errors = (state && !state.ok && state.fieldErrors) || {};
  const id = category?.id ?? "new";
  const v = (key: keyof Category) => values[key] ?? String(category?.[key] ?? "");

  return (
    <form action={action} className="space-y-4" noValidate>
      {state && (state.ok ? <FormMessage type="success">{state.message}</FormMessage> : <FormMessage type="error">{state.error}</FormMessage>)}
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_100px]">
        <Field label="Нэр" htmlFor={`${id}-name`} required error={errors.name}>
          <Input id={`${id}-name`} name="name" defaultValue={v("name")} required {...errorProps(`${id}-name`, errors.name)} />
        </Field>
        <Field label="Slug (URL)" htmlFor={`${id}-slug`} required error={errors.slug}>
          <Input id={`${id}-slug`} name="slug" defaultValue={v("slug")} placeholder="outerwear" required {...errorProps(`${id}-slug`, errors.slug)} />
        </Field>
        <Field label="Дараалал" htmlFor={`${id}-sort`} error={errors.sort_order}>
          <Input id={`${id}-sort`} name="sort_order" inputMode="numeric" defaultValue={v("sort_order") || "0"} {...errorProps(`${id}-sort`, errors.sort_order)} />
        </Field>
      </div>
      <Field label="Зургийн холбоос" htmlFor={`${id}-image`} error={errors.image_url} hint="Заавал биш. https://images.unsplash.com/... эсвэл Supabase Storage холбоос">
        <Input id={`${id}-image`} name="image_url" type="url" defaultValue={v("image_url")} {...errorProps(`${id}-image`, errors.image_url)} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending && <LoaderCircle className="size-4 animate-spin" />}
        {category ? "Хадгалах" : "Ангилал нэмэх"}
      </Button>
    </form>
  );
}
