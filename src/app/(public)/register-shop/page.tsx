import type { Metadata } from "next";
import Link from "next/link";
import { RegisterShopForm } from "./register-form";
import { SetupNotice } from "@/components/layout/setup-notice";
import { Container } from "@/components/ui/misc";
import { THRIFTUB_INSTAGRAM } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Дэлгүүр бүртгүүлэх",
  description: "Second hand, vintage дэлгүүрээ ThriftUB-д бүртгүүлээрэй — эхний сард 200 хүртэл бараа үнэгүй.",
  alternates: { canonical: "/register-shop" },
};

const STEPS = [
  "Дэлгүүрийн мэдээллээ бөглөнө",
  "Админ шалгаж баталгаажуулна",
  "Бараагаа нэмж, худалдан авагчидтай холбогдоно",
];

export default function RegisterShopPage() {
  return (
    <Container className="py-14 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">Дэлгүүр эзэмшигчдэд</p>
            <h1 className="mt-3 font-serif font-semibold text-3xl leading-tight tracking-tight sm:text-4xl">Дэлгүүрээ бүртгүүлэх</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Эхний 1 сард 200 хүртэл бараагаа үнэгүй оруулна. 2 дахь сараас Pro (500 бараа, 59,000₮), Premium (1000 бараа, 89,000₮), Max (хязгааргүй, 139,000₮) багцаас сонгоно. Багц авах бол{" "}
              <a href={THRIFTUB_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="border-b border-ink/30 font-medium text-ink hover:border-glow hover:text-glow">Instagram хуудас</a>{" "}
              руу маань DM бичээрэй.
              Худалдан авалтын төлбөр, хүргэлтийг бид зохицуулдаггүй — худалдан авагчид тантай Instagram, Facebook
              эсвэл утсаар шууд холбогдоно.
            </p>
            <ol className="mt-8 space-y-4">
              {STEPS.map((s, i) => (
                <li key={s} className="flex gap-4 text-sm">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-ink/30 font-serif font-semibold tracking-tight">{i + 1}</span>
                  <span className="pt-1 text-ink-soft">{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-10 text-sm text-muted">
              Бүртгэлтэй юу?{" "}
              <Link href="/login" className="border-b border-ink/30 font-medium text-ink hover:border-glow hover:text-glow">Нэвтрэх</Link>
            </p>
          </div>
        </aside>
        <div className="lg:col-span-8">
          {isSupabaseConfigured ? <RegisterShopForm /> : <SetupNotice feature="Дэлгүүр бүртгүүлэх хэсэг" />}
        </div>
      </div>
    </Container>
  );
}
