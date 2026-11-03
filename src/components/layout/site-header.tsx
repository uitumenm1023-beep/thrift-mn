"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, Search, UserRound, X } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/format";

const NAV = [
  { href: "/", label: "Нүүр" },
  { href: "/products", label: "Бүх бараа" },
  { href: "/shops", label: "Дэлгүүрүүд" },
  { href: "/categories", label: "Ангилал" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-baseline font-display text-[1.35rem] leading-none font-bold tracking-tight", className)}>
      thrift<span className="text-glow">.mn</span>
    </Link>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors duration-300",
          scrolled ? "border-line bg-paper/85 backdrop-blur-md" : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-6 px-5 sm:h-[72px] sm:px-8">
          <Logo />

          <nav aria-label="Үндсэн цэс" className="ml-8 hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative font-mono text-[12px] tracking-[0.12em] text-ink-soft uppercase transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-glow after:transition-all after:duration-300 hover:text-glow hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center rounded-full transition-colors hover:bg-ink/8 hover:text-glow"
              aria-label="Хайх"
            >
              <Search className="size-[19px]" strokeWidth={1.75} />
            </button>
            <Link
              href="/login"
              className="hidden size-10 place-items-center rounded-full transition-colors hover:bg-ink/8 hover:text-glow sm:grid"
              aria-label="Нэвтрэх"
              title="Нэвтрэх"
            >
              <UserRound className="size-[19px]" strokeWidth={1.75} />
            </Link>
            <Link href="/register-shop" className={buttonClasses("primary", "sm", "ml-2 max-md:hidden")}>
              Дэлгүүрээ бүртгүүлэх
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid size-10 place-items-center rounded-full transition-colors hover:bg-ink/8 lg:hidden"
              aria-label="Цэс нээх"
              aria-expanded={menuOpen}
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Цэс">
      <div className="absolute inset-0 animate-fade-in bg-night/70 backdrop-blur-sm" onClick={onClose} />
      <div className="glow-bg absolute inset-y-0 right-0 flex w-[min(88vw,380px)] animate-slide-in flex-col border-l border-line px-6 pt-5 pb-8">
        <div className="flex items-center justify-between">
          <Logo />
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-ink/8" aria-label="Цэс хаах">
            <X className="size-5" />
          </button>
        </div>
        <nav aria-label="Гар утасны цэс" className="mt-10 flex flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center justify-between border-b border-line py-4 font-serif font-semibold tracking-tight text-xl"
            >
              {item.label}
              <ArrowRight className="size-4 text-taupe" />
            </Link>
          ))}
          <Link href="/login" onClick={onClose} className="flex items-center justify-between border-b border-line py-4 font-serif font-semibold tracking-tight text-xl">
            Нэвтрэх
            <ArrowRight className="size-4 text-taupe" />
          </Link>
        </nav>
        <Link href="/register-shop" onClick={onClose} className={buttonClasses("primary", "lg", "mt-auto w-full")}>
          Дэлгүүрээ бүртгүүлэх
        </Link>
      </div>
    </div>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  useEscape(onClose);
  useEffect(() => inputRef.current?.focus(), []);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Бараа хайх">
      <div className="absolute inset-0 animate-fade-in bg-night/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative animate-fade-up border-b border-line bg-paper shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        <form
          className="mx-auto flex h-24 max-w-[1320px] items-center gap-4 px-5 sm:h-28 sm:px-8"
          onSubmit={(e) => {
            e.preventDefault();
            const q = inputRef.current?.value.trim() ?? "";
            onClose();
            router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
          }}
        >
          <Search className="size-6 shrink-0 text-glow" strokeWidth={1.5} />
          <label htmlFor="site-search" className="sr-only">Барааны нэрээр хайх</label>
          <input
            ref={inputRef}
            id="site-search"
            type="search"
            name="q"
            placeholder="Юу хайж байна? Жишээ нь: жинс, арьсан куртик…"
            className="min-w-0 flex-1 bg-transparent font-serif font-semibold tracking-tight text-lg outline-none placeholder:text-muted/60 sm:text-2xl"
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-ink/8" aria-label="Хайлт хаах">
            <X className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function useEscape(onEscape: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onEscape();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEscape]);
}
