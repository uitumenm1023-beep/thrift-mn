import { DatabaseZap } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/**
 * Shown instead of auth and dashboard features while Supabase env vars are
 * missing — nothing pretends to save data that has nowhere to go.
 */
export function SetupNotice({ feature }: { feature: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-line bg-paper-deep p-8 text-center sm:p-10">
      <span className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-paper-deep">
        <DatabaseZap className="size-6 text-taupe" strokeWidth={1.5} />
      </span>
      <h1 className="font-serif font-semibold tracking-tight text-xl">Supabase тохируулагдаагүй байна</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        {feature} ажиллахын тулд мэдээллийн сан холбогдсон байх шаардлагатай. Одоогоор сайт демо горимд
        ажиллаж байна.
      </p>
      <ol className="mt-6 space-y-2 text-left text-sm text-ink-soft">
        <li>1. supabase.com дээр үнэгүй төсөл үүсгэнэ.</li>
        <li>2. <code className="rounded-xl bg-paper-deep px-1">supabase/migrations</code> доторх SQL файлуудыг дарааллаар нь ажиллуулна.</li>
        <li>3. <code className="rounded-xl bg-paper-deep px-1">.env.local</code> файлд <code className="rounded-xl bg-paper-deep px-1">NEXT_PUBLIC_SUPABASE_URL</code> болон <code className="rounded-xl bg-paper-deep px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>-г бичээд серверээ дахин асаана.</li>
      </ol>
      <p className="mt-4 text-[13px] text-muted">Дэлгэрэнгүй заавар README.md файлд бий.</p>
      <ButtonLink href="/" variant="outline" className="mt-6">Нүүр хуудас руу буцах</ButtonLink>
    </div>
  );
}
