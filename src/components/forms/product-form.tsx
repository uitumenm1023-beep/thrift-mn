"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, X } from "lucide-react";
import { saveProduct } from "@/app/dashboard/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { errorProps, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import {
  CLOTHING_SIZES,
  CONDITIONS,
  MAX_PRODUCT_IMAGES,
  ONE_SIZE,
  SHOE_SIZES,
  STORAGE_BUCKETS,
} from "@/lib/constants";
import { cn } from "@/lib/format";
import { ACCEPT_ATTR, checkImageFile, storagePathFromUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";
import { uploadImage } from "@/lib/upload";

interface Photo {
  key: string;
  /** Set for images that are already uploaded */
  url?: string;
  /** Set for newly picked files */
  file?: File;
  preview: string;
}

export interface ProductFormValues {
  id?: string;
  name: string;
  description: string;
  price: number | "";
  category_id: string;
  size: string;
  condition: string;
  is_available: boolean;
  images: string[];
}

export function ProductForm({
  userId,
  categories,
  initial,
}: {
  userId: string;
  categories: Pick<Category, "id" | "name">[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>(
    () => initial?.images.map((url) => ({ key: url, url, preview: url })) ?? [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const isEdit = Boolean(initial?.id);

  // Free blob previews when the form unmounts.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => p.file && URL.revokeObjectURL(p.preview)), []);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_PRODUCT_IMAGES - photos.length;
    const picked: Photo[] = [];
    let problem: string | null = null;
    for (const file of Array.from(files)) {
      const err = checkImageFile(file);
      if (err) problem = err;
      else if (picked.length < room) picked.push({ key: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
      else problem = `Хамгийн ихдээ ${MAX_PRODUCT_IMAGES} зураг оруулна.`;
    }
    setPhotos((list) => [...list, ...picked]);
    setErrors((e) => {
      const next = { ...e };
      if (problem) next.images = problem;
      else delete next.images;
      return next;
    });
    if (fileInput.current) fileInput.current.value = "";
  };

  const move = (index: number, delta: number) =>
    setPhotos((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item!);
      return next;
    });

  const remove = (index: number) =>
    setPhotos((list) => {
      const photo = list[index];
      if (photo?.file) URL.revokeObjectURL(photo.preview);
      return list.filter((_, i) => i !== index);
    });

  const submit = (formData: FormData) => {
    setMessage(null);
    if (!photos.length) {
      setErrors({ images: "Дор хаяж нэг зураг оруулна уу." });
      return;
    }

    start(async () => {
      const uploaded: string[] = [];
      try {
        const urls: string[] = [];
        const newCount = photos.filter((p) => p.file).length;
        for (const photo of photos) {
          if (photo.url) {
            urls.push(photo.url);
            continue;
          }
          setStep(`Зураг хуулж байна (${uploaded.length + 1}/${newCount})…`);
          const url = await uploadImage(STORAGE_BUCKETS.products, userId, photo.file!);
          uploaded.push(url);
          urls.push(url);
        }

        setStep("Хадгалж байна…");
        if (initial?.id) formData.set("id", initial.id);
        formData.delete("images");
        urls.forEach((u) => formData.append("images", u));

        const result = await saveProduct(formData);
        if (!result.ok) {
          setErrors(result.fieldErrors ?? {});
          setMessage(result.error);
          await discard(uploaded);
          return;
        }
        // Keep successfully uploaded photos as "existing" in case the user stays.
        setPhotos(urls.map((url) => ({ key: url, url, preview: url })));
        router.push("/dashboard/products");
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Алдаа гарлаа. Дахин оролдоно уу.");
        await discard(uploaded);
      } finally {
        setStep(null);
      }
    });
  };

  const v = (key: keyof ProductFormValues) => String(initial?.[key] ?? "");

  return (
    <form
      // onSubmit (not action=) so React doesn't reset the inputs; uploads and
      // the Server Action call run inside a transition in submit().
      onSubmit={(e) => {
        e.preventDefault();
        if (!pending) submit(new FormData(e.currentTarget));
      }}
      className="max-w-3xl space-y-8"
      noValidate
    >
      {message && <FormMessage type="error">{message}</FormMessage>}

      <section aria-labelledby="photos-label">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="photos-label" className="text-[13px] font-medium text-ink-soft">
            Зураг <span className="text-rust">*</span>
          </h2>
          <span className="text-[12px] text-muted">{photos.length}/{MAX_PRODUCT_IMAGES} · Эхний зураг нүүр зураг болно</span>
        </div>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {photos.map((photo, i) => (
            <li key={photo.key} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-deep">
              <Image src={photo.preview} alt={`${i + 1}-р зураг`} fill sizes="160px" className="object-cover" unoptimized={Boolean(photo.file)} />
              {i === 0 && <span className="absolute top-1.5 left-1.5 rounded-xl bg-glow px-2 py-0.5 font-mono text-[10px] text-night">Нүүр</span>}
              <button type="button" onClick={() => remove(i)} aria-label={`${i + 1}-р зургийг устгах`}
                className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-paper/90 text-ink hover:bg-sand">
                <X className="size-3.5" />
              </button>
              <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Зүүн тийш зөөх"
                  className="grid size-7 place-items-center rounded-full bg-paper/90 disabled:invisible">
                  <ArrowLeft className="size-3.5" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Баруун тийш зөөх"
                  className="grid size-7 place-items-center rounded-full bg-paper/90 disabled:invisible">
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
          {photos.length < MAX_PRODUCT_IMAGES && (
            <li>
              <button type="button" onClick={() => fileInput.current?.click()}
                className={cn(
                  "flex aspect-[4/5] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-[12px] text-muted transition-colors hover:border-glow hover:text-glow hover:text-ink",
                  errors.images ? "border-rust" : "border-taupe/60",
                )}>
                <ImagePlus className="size-5" strokeWidth={1.5} />
                Зураг нэмэх
              </button>
            </li>
          )}
        </ul>
        <input ref={fileInput} type="file" accept={ACCEPT_ATTR} multiple className="sr-only" aria-labelledby="photos-label" onChange={(e) => addFiles(e.target.files)} />
        {errors.images ? (
          <p className="mt-2 text-[13px] text-rust" role="alert">{errors.images}</p>
        ) : (
          <p className="mt-2 text-[12px] text-muted">JPG, PNG, WEBP. Зургийг автоматаар жижигрүүлж хуулна.</p>
        )}
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Барааны нэр" htmlFor="name" required error={errors.name} className="sm:col-span-2">
          <Input id="name" name="name" defaultValue={v("name")} maxLength={120} required placeholder="Жишээ нь: Vintage ноосон пальто" {...errorProps("name", errors.name)} />
        </Field>
        <Field label="Үнэ (₮)" htmlFor="price" required error={errors.price}>
          <Input id="price" name="price" inputMode="numeric" defaultValue={v("price")} required placeholder="45000" {...errorProps("price", errors.price)} />
        </Field>
        <Field label="Ангилал" htmlFor="category_id" required error={errors.category_id}>
          <Select id="category_id" name="category_id" defaultValue={v("category_id")} required {...errorProps("category_id", errors.category_id)}>
            <option value="">Сонгох</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Хэмжээ" htmlFor="size" required error={errors.size}>
          <Select id="size" name="size" defaultValue={v("size")} required {...errorProps("size", errors.size)}>
            <option value="">Сонгох</option>
            <optgroup label="Хувцас">
              {CLOTHING_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </optgroup>
            <optgroup label="Гутал">
              {SHOE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </optgroup>
            <option value={ONE_SIZE}>{ONE_SIZE}</option>
          </Select>
        </Field>
        <Field label="Төлөв" htmlFor="condition" required error={errors.condition}>
          <Select id="condition" name="condition" defaultValue={v("condition")} required {...errorProps("condition", errors.condition)}>
            <option value="">Сонгох</option>
            {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </Field>
        <Field label="Тайлбар" htmlFor="description" error={errors.description} hint="Материал, урт, өргөн, онцлог, гэмтэл байгаа эсэх" className="sm:col-span-2">
          <Textarea id="description" name="description" defaultValue={v("description")} rows={5} maxLength={3000} {...errorProps("description", errors.description)} />
        </Field>
        <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="is_available"
            defaultChecked={initial?.is_available ?? true}
            className="size-4 accent-glow"
          />
          Худалдаанд байгаа (тэмдэглэгээг арилгавал “Зарагдсан” гэж харагдана)
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          {isEdit ? "Хадгалах" : "Бараа нэмэх"}
        </Button>
        <ButtonLink href="/dashboard/products" variant="ghost" size="lg">Болих</ButtonLink>
        {step && <span className="text-sm text-muted" aria-live="polite">{step}</span>}
      </div>
    </form>
  );
}

/** Removes files uploaded for a save that then failed. */
async function discard(urls: string[]) {
  const paths = urls
    .map((u) => storagePathFromUrl(u, STORAGE_BUCKETS.products))
    .filter((p): p is string => Boolean(p));
  if (paths.length) await createClient().storage.from(STORAGE_BUCKETS.products).remove(paths);
}
