import type { Metadata } from "next";
import { Suspense } from "react";
import { LayoutDashboard, Package, Store, Tags } from "lucide-react";
import { DashboardShell, ShellSkeleton, type NavItem } from "@/components/dashboard/shell";
import { SetupNotice } from "@/components/layout/setup-notice";
import { requireRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Private, per-user pages: always rendered on request, so opt out of
// instant-navigation validation (it also cannot render them in demo mode).
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Админ", template: "%s · Админ | ThriftUB" },
  robots: { index: false },
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Тойм", icon: LayoutDashboard, exact: true },
  { href: "/admin/shops", label: "Дэлгүүрүүд", icon: Store },
  { href: "/admin/products", label: "Бараа", icon: Package },
  { href: "/admin/categories", label: "Ангилал", icon: Tags },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!isSupabaseConfigured) {
    return (
      <main id="main" className="px-5 py-16">
        <SetupNotice feature="Админы самбар" />
      </main>
    );
  }
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");
  return (
    <DashboardShell
      title="Админ"
      nav={NAV}
      subtitle={<p className="font-serif font-semibold tracking-tight text-base leading-tight">{user.profile.full_name || user.email}</p>}
    >
      {children}
    </DashboardShell>
  );
}
