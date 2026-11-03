import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Logo } from "@/components/layout/site-header";
import { NavLink } from "./nav-link";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

/** Sidebar layout used by both the shop owner and admin dashboards. */
export function DashboardShell({
  title,
  subtitle,
  nav,
  extra,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  nav: NavItem[];
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-paper-deep/50 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-5 pt-5 lg:block lg:px-6 lg:pt-7">
          <Logo className="text-2xl" />
          <form action={signOut} className="lg:hidden">
            <button type="submit" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
              <LogOut className="size-4" /> Гарах
            </button>
          </form>
        </div>
        <div className="px-5 pt-4 lg:px-6 lg:pt-8">
          <p className="eyebrow">{title}</p>
          {subtitle && <div className="mt-1.5 text-sm">{subtitle}</div>}
        </div>
        <nav aria-label="Хянах самбар" className="flex gap-1 overflow-x-auto px-3 py-4 lg:flex-col lg:px-4 lg:py-6">
          {nav.map(({ href, label, icon: Icon, exact }) => (
            <NavLink key={href} href={href} exact={exact}>
              <Icon className="size-4" strokeWidth={1.75} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden space-y-1 px-4 pb-6 lg:mt-auto lg:block">
          {extra}
          <Link href="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-soft hover:bg-ink/8">
            <ExternalLink className="size-4" strokeWidth={1.75} /> Сайт руу очих
          </Link>
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-soft hover:bg-ink/8">
              <LogOut className="size-4" strokeWidth={1.75} /> Гарах
            </button>
          </form>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif font-semibold text-2xl tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-[15px] text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-paper-deep p-5">
      <p className="eyebrow !text-[10px]">{label}</p>
      <p className="mt-2 font-serif font-semibold tracking-tight text-3xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[13px] text-muted">{hint}</p>}
    </div>
  );
}

export function ShellSkeleton() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <div className="hidden bg-paper-deep/50 lg:block" />
      <div className="space-y-4 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-paper-deep" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-xl bg-paper-deep" />
        <div className="grid gap-4 pt-6 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-paper-deep" />)}
        </div>
      </div>
    </div>
  );
}
