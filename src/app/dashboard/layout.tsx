import type { Metadata } from "next";
import { Suspense } from "react";
import { LayoutDashboard, Package, PackagePlus, Store } from "lucide-react";
import { DashboardShell, ShellSkeleton, type NavItem } from "@/components/dashboard/shell";
import { SetupNotice } from "@/components/layout/setup-notice";
import { ShopStatusBadge } from "@/components/dashboard/status-badge";
import { getOwnShop, requireRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Private, per-user pages: always rendered on request, so opt out of
// instant-navigation validation (it also cannot render them in demo mode).
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Хянах самбар", template: "%s · Хянах самбар | ThriftUB" },
  robots: { index: false },
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Тойм", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/products", label: "Миний бараа", icon: Package },
  { href: "/dashboard/products/new", label: "Бараа нэмэх", icon: PackagePlus, exact: true },
  { href: "/dashboard/profile", label: "Дэлгүүрийн мэдээлэл", icon: Store },
];

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  if (!isSupabaseConfigured) {
    return (
      <main id="main" className="px-5 py-16">
        <SetupNotice feature="Дэлгүүрийн хянах самбар" />
      </main>
    );
  }
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <OwnerGate>{children}</OwnerGate>
    </Suspense>
  );
}

async function OwnerGate({ children }: { children: React.ReactNode }) {
  const user = await requireRole("shop_owner");
  const shop = await getOwnShop();
  return (
    <DashboardShell
      title="Дэлгүүрийн самбар"
      nav={NAV}
      subtitle={
        <>
          <p className="font-serif font-semibold tracking-tight text-base leading-tight">{shop?.name ?? user.profile.full_name}</p>
          {shop && (
            <ShopStatusBadge status={shop.status} className="mt-2" />
          )}
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
