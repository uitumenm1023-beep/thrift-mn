"use client";

import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { Check, Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react";
import { registerShop } from "@/app/auth/actions";
import { updateShopImage } from "@/app/dashboard/actions";
import { ShopFields } from "@/components/forms/shop-fields";
import { SingleImageInput } from "@/components/forms/single-image-input";
import { Button, ButtonLink } from "@/components/ui/button";
import { errorProps, Field, FormMessage, Input } from "@/components/ui/field";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { ActionResult } from "@/lib/types";
import { formValues } from "@/lib/form-values";
import { uploadImage } from "@/lib/upload";
import { PASSWORD_RULES } from "@/lib/validation";
import { cn } from "@/lib/format";

type State = ActionResult<{ userId: string; signedIn: boolean }> | null;

export function RegisterShopForm() {
  const router = useRouter();
  const logo = useRef<File | null | undefined>(undefined);
  const [logoFailed, setLogoFailed] = useState(false);
  // React resets the form after an action; keep what was typed so a
  // validation error doesn't wipe it.
  const [values, setValues] = useState<Record<string, string>>({});

  const [state, action, pending] = useActionState<State, FormData>(async (prev, formData) => {
    setValues(formValues(formData));
    const result = await registerShop(prev, formData);
    if (result.ok && result.data?.signedIn) {
      // Email confirmation is off, so we have a session: upload the logo now.
      if (logo.current) {
        try {
          const url = await uploadImage(STORAGE_BUCKETS.shops, result.data.userId, logo.current);
          const saved = await updateShopImage("logo", url);
          if (!saved.ok) throw new Error(saved.error);
        } catch {
          setLogoFailed(true);
        }
      }
      router.push("/dashboard?welcome=1");
      router.refresh();
    }
    return result;
  }, null);

  if (state?.ok && !state.data?.signedIn) {
    return (
      <div className="rounded-xl border border-line bg-paper-deep p-8 text-center sm:p-12">
        <span className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-success/12">
          <MailCheck className="size-6 text-success" strokeWidth={1.5} />
        </span>
        <h2 className="font-serif font-semibold tracking-tight text-2xl">Имэйлээ шалгана уу</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          Бүртгэл үүслээ. Имэйл хаяг руу тань баталгаажуулах холбоос илгээлээ. Холбоос дээр дарж нэвтэрсний
          дараа лого болон бараагаа нэмэх боломжтой. Таны дэлгүүр админ баталгаажуулсны дараа нийтэд харагдана.
        </p>
        <ButtonLink href="/login" variant="outline" className="mt-6">Нэвтрэх хуудас</ButtonLink>
      </div>
    );
  }

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-line bg-paper-deep p-10 text-center">
        <LoaderCircle className="mx-auto size-6 animate-spin text-taupe" />
        <p className="mt-4 text-muted">
          Бүртгэл амжилттай. Хянах самбар руу шилжиж байна…
          {logoFailed && " (Лого хуулагдсангүй — самбараас дахин оруулна уу.)"}
        </p>
      </div>
    );
  }

  const errors = (state && !state.ok && state.fieldErrors) || {};

  return (
    <form action={action} className="space-y-10" noValidate>
      {state && !state.ok && <FormMessage type="error">{state.error}</FormMessage>}

      <fieldset className="space-y-5">
        <legend className="mb-5 font-serif font-semibold tracking-tight text-xl">Эзэмшигчийн мэдээлэл</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Таны нэр" htmlFor="full_name" required error={errors.full_name} className="sm:col-span-2">
            <Input id="full_name" name="full_name" autoComplete="name" defaultValue={values.full_name} required {...errorProps("full_name", errors.full_name)} />
          </Field>
          <Field label="Имэйл" htmlFor="email" required error={errors.email}>
            <Input id="email" name="email" type="email" autoComplete="email" defaultValue={values.email} required {...errorProps("email", errors.email)} />
          </Field>
          <PasswordField error={errors.password} />
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-10">
        <legend className="mb-5 font-serif font-semibold tracking-tight text-xl">Дэлгүүрийн мэдээлэл</legend>
        <SingleImageInput
          label="Лого"
          hint="Заавал биш. Дараа нь хянах самбараас нэмж болно."
          onChange={(file) => (logo.current = file)}
        />
        <ShopFields errors={errors} defaults={values} />
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted">Бүртгүүлснээр таны дэлгүүр админы шалгалтад орно.</p>
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          Бүртгүүлэх
        </Button>
      </div>
    </form>
  );
}

/** Password input with a show/hide toggle and a live checklist of the rules. */
function PasswordField({ error }: { error?: string }) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  return (
    <Field label="Нууц үг" htmlFor="password" required error={error}>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pr-11"
          aria-describedby="password-rules"
          {...errorProps("password", error)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink"
          aria-label={visible ? "Нууц үгийг нуух" : "Нууц үгийг харуулах"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <ul id="password-rules" className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-[12px]">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <li key={rule.id} className={cn("flex items-center gap-1.5 transition-colors", ok ? "text-success" : "text-muted")}>
              <span className={cn("grid size-3.5 place-items-center rounded-full border", ok ? "border-success bg-success/20" : "border-muted/50")}>
                {ok && <Check className="size-2.5" strokeWidth={3} />}
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </Field>
  );
}
