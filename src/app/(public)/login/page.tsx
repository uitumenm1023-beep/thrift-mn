import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { SetupNotice } from "@/components/layout/setup-notice";
import { Container, Skeleton } from "@/components/ui/misc";
import { FormMessage } from "@/components/ui/field";
import { getCurrentUser, homeForRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Нэвтрэх",
  robots: { index: false },
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  if (!isSupabaseConfigured) {
    return (
      <Container className="py-16">
        <SetupNotice feature="Нэвтрэх, бүртгүүлэх хэсэг" />
      </Container>
    );
  }

  return (
    <Container className="py-14 sm:py-20">
      <div className="mx-auto max-w-md">
        <p className="eyebrow text-center">Дэлгүүр эзэмшигч, админ</p>
        <h1 className="mt-3 text-center font-serif font-semibold text-3xl tracking-tight">Нэвтрэх</h1>
        <p className="mt-3 text-center text-[15px] text-muted">
          Худалдан авагчид бүртгэлгүйгээр бараа үзэж, дэлгүүртэй шууд холбогдох боломжтой.
        </p>
        <div className="mt-10">
          <Suspense fallback={<Skeleton className="h-72" />}>
            <LoginBody searchParams={searchParams} />
          </Suspense>
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          Дэлгүүрээ бүртгүүлээгүй юу?{" "}
          <Link href="/register-shop" className="border-b border-ink/30 font-medium text-ink hover:border-glow hover:text-glow">
            Дэлгүүр бүртгүүлэх
          </Link>
        </p>
      </div>
    </Container>
  );
}

async function LoginBody({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const denied = one(sp.denied) === "1";

  // Already signed in → go to the right home, unless they were bounced here
  // for lacking a role (then show why instead of looping).
  const user = await getCurrentUser();
  if (user && !denied) redirect(homeForRole(user.profile.role));

  return (
    <div className="space-y-4">
      {denied && (
        <FormMessage type="error">
          Энэ хуудсыг үзэх эрх таны бүртгэлд байхгүй байна.{user ? " Өөр бүртгэлээр нэвтэрнэ үү." : ""}
        </FormMessage>
      )}
      {one(sp.error) === "link" && (
        <FormMessage type="error">Баталгаажуулах холбоос хүчингүй эсвэл хугацаа нь дууссан байна. Дахин нэвтэрч үзнэ үү.</FormMessage>
      )}
      <LoginForm next={one(sp.next)} />
    </div>
  );
}
