"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { saveShopProfile } from "@/app/dashboard/actions";
import { ShopFields } from "@/components/forms/shop-fields";
import { SingleImageInput } from "@/components/forms/single-image-input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/field";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { ActionResult, Shop } from "@/lib/types";
import { uploadImage } from "@/lib/upload";

export function ShopProfileForm({ userId, shop }: { userId: string; shop: Shop | null }) {
  const router = useRouter();
  const logo = useRef<File | null | undefined>(undefined);
  const cover = useRef<File | null | undefined>(undefined);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  const submit = (formData: FormData) =>
    start(async () => {
      setResult(null);
      try {
        // undefined = unchanged, null = removed, File = replace.
        const resolve = async (choice: File | null | undefined, current: string | null | undefined) =>
          choice === undefined ? (current ?? "") : choice === null ? "" : uploadImage(STORAGE_BUCKETS.shops, userId, choice);
        formData.set("logo_url", await resolve(logo.current, shop?.logo_url));
        formData.set("cover_url", await resolve(cover.current, shop?.cover_url));
        const res = await saveShopProfile(null, formData);
        setResult(res);
        if (res.ok) {
          logo.current = undefined;
          cover.current = undefined;
          router.refresh();
        }
      } catch (e) {
        setResult({ ok: false, error: e instanceof Error ? e.message : "Алдаа гарлаа." });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

  const errors = (result && !result.ok && result.fieldErrors) || {};

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!pending) submit(new FormData(e.currentTarget));
      }}
      className="max-w-3xl space-y-8"
      noValidate
    >
      {result && (result.ok ? <FormMessage type="success">{result.message}</FormMessage> : <FormMessage type="error">{result.error}</FormMessage>)}

      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <SingleImageInput label="Лого" initialUrl={shop?.logo_url} onChange={(f) => (logo.current = f)} />
        <SingleImageInput label="Нүүр зураг" hint="Хэвтээ зураг тохиромжтой (жишээ нь 1600×600)" shape="wide" initialUrl={shop?.cover_url} onChange={(f) => (cover.current = f)} />
      </div>

      <ShopFields defaults={shop ?? {}} errors={errors} />

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          Хадгалах
        </Button>
        <p className="text-[13px] text-muted">Дэлгүүрийн төлөвийг зөвхөн админ өөрчилнө.</p>
      </div>
    </form>
  );
}
