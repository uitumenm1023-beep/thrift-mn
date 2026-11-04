"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, LocateFixed, Search, SlidersHorizontal, X } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Select, inputClasses } from "@/components/ui/field";
import { CLOTHING_SIZES, CONDITIONS, DISTRICT_CENTERS, DISTRICTS, ONE_SIZE, SHOE_SIZES, SORT_OPTIONS } from "@/lib/constants";
import { countActiveFilters, filtersToQuery, type ProductFilters } from "@/lib/filters";
import { cn } from "@/lib/format";
import type { ProductCondition } from "@/lib/types";

interface Option {
  value: string;
  label: string;
}

interface Props {
  filters: ProductFilters;
  categories: Option[];
  shops: Option[];
  /** Base path, e.g. "/products" or "/shops/<id>" */
  basePath?: string;
  /** Hide the shop selector (on a shop's own page). */
  hideShop?: boolean;
}

function readDistricts(fd: FormData, current: ProductFilters) {
  if (!fd.has("district-group")) return { districts: current.districts, near: current.near };
  const districts = fd.getAll("district").map(String);
  // Keep the "near me" label only while the selection is unchanged.
  const same = districts.length === current.districts.length && districts.every((d) => current.districts.includes(d));
  return { districts, near: current.near && same };
}

function readForm(form: HTMLFormElement, current: ProductFilters): ProductFilters {
  const fd = new FormData(form);
  const num = (k: string) => {
    const v = String(fd.get(k) ?? "").replace(/[\s,₮]/g, "");
    return v && Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : null;
  };
  return {
    ...current,
    category: String(fd.get("category") ?? ""),
    minPrice: num("min"),
    maxPrice: num("max"),
    sizes: fd.getAll("size").map(String),
    conditions: fd.getAll("condition").map(String) as ProductCondition[],
    shop: fd.has("shop") ? String(fd.get("shop")) : current.shop,
    includeSold: fd.get("sold") === "1",
    ...readDistricts(fd, current),
    page: 1,
  };
}

/** Sidebar on desktop, slide-over drawer on mobile. */
export function ProductFilterPanel({ filters, categories, shops, basePath = "/products", hideShop }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(filters) - (hideShop && filters.shop ? 1 : 0);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const apply = (next: ProductFilters) => router.push(`${basePath}${filtersToQuery(next)}`, { scroll: false });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOpen(false);
    apply(readForm(e.currentTarget, filters));
  };

  // On desktop, checkboxes / radios / selects apply immediately.
  const onChange = (e: FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.type === "number") return;
    if (window.matchMedia("(min-width: 1024px)").matches) {
      apply(readForm(e.currentTarget, filters));
    }
  };

  const clearHref = `${basePath}${filtersToQuery({ q: filters.q, sort: filters.sort, shop: hideShop ? filters.shop : "" })}`;

  return (
    <>
      <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)} aria-expanded={open}>
        <SlidersHorizontal className="size-4" />
        Шүүлтүүр{active > 0 && ` (${active})`}
      </Button>

      {open && <div className="fixed inset-0 z-40 animate-fade-in bg-night/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          "lg:block",
          open
            ? "fixed inset-y-0 right-0 z-50 flex w-[min(92vw,400px)] animate-slide-in flex-col bg-paper lg:static lg:z-auto lg:w-auto lg:animate-none lg:bg-transparent"
            : "hidden",
        )}
        aria-label="Шүүлтүүр"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
          <p className="font-serif font-semibold tracking-tight text-lg">Шүүлтүүр</p>
          <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-ink/8" aria-label="Шүүлтүүр хаах">
            <X className="size-5" />
          </button>
        </div>

        <form
          key={filtersToQuery(filters)}
          onSubmit={onSubmit}
          onChange={onChange}
          // No bottom padding: the sticky button bar must sit flush with the
          // drawer's bottom edge, or options scroll through the gap below it.
          className="flex-1 space-y-8 overflow-y-auto px-5 pt-6 lg:overflow-visible lg:p-0"
        >
          <FilterGroup title="Ангилал">
            <div className="space-y-1">
              <Radio name="category" value="" label="Бүгд" defaultChecked={!filters.category} />
              {categories.map((c) => (
                <Radio key={c.value} name="category" value={c.value} label={c.label} defaultChecked={filters.category === c.value} />
              ))}
            </div>
          </FilterGroup>

          {!hideShop && (
            <FilterGroup title="Дүүрэг">
              <input type="hidden" name="district-group" value="1" />
              <NearMeButton
                onFound={(district) => {
                  setOpen(false);
                  apply({ ...filters, districts: [district], near: true, page: 1 });
                }}
              />
              <div className="mt-3 space-y-1">
                {DISTRICTS.map((d) => (
                  <Checkbox key={d} name="district" value={d} label={d} defaultChecked={filters.districts.includes(d)} />
                ))}
              </div>
            </FilterGroup>
          )}

          <FilterGroup title="Үнэ (₮)">
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="min-price">Доод үнэ</label>
              <input id="min-price" name="min" type="number" inputMode="numeric" min={0} step={1000} placeholder="Доод"
                defaultValue={filters.minPrice ?? ""} className={cn(inputClasses, "py-2 text-sm")} />
              <span className="text-muted">—</span>
              <label className="sr-only" htmlFor="max-price">Дээд үнэ</label>
              <input id="max-price" name="max" type="number" inputMode="numeric" min={0} step={1000} placeholder="Дээд"
                defaultValue={filters.maxPrice ?? ""} className={cn(inputClasses, "py-2 text-sm")} />
            </div>
            <Button type="submit" variant="ghost" size="sm" className="mt-2 !px-0 underline underline-offset-4 max-lg:hidden">
              Үнээр шүүх
            </Button>
          </FilterGroup>

          <FilterGroup title="Хэмжээ">
            <div className="flex flex-wrap gap-1.5">
              {[...CLOTHING_SIZES, ...SHOE_SIZES, ONE_SIZE].map((s) => (
                <Chip key={s} name="size" value={s} label={s} defaultChecked={filters.sizes.includes(s)} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Төлөв">
            <div className="space-y-1">
              {CONDITIONS.map((c) => (
                <Checkbox key={c.value} name="condition" value={c.value} label={c.label} defaultChecked={filters.conditions.includes(c.value)} />
              ))}
            </div>
          </FilterGroup>

          {!hideShop && shops.length > 0 && (
            <FilterGroup title="Дэлгүүр">
              <label className="sr-only" htmlFor="shop-filter">Дэлгүүр сонгох</label>
              <Select id="shop-filter" name="shop" defaultValue={filters.shop} className="py-2 text-sm">
                <option value="">Бүх дэлгүүр</option>
                {shops.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </FilterGroup>
          )}

          <FilterGroup title="Бусад">
            <Checkbox name="sold" value="1" label="Зарагдсан барааг харуулах" defaultChecked={filters.includeSold} />
          </FilterGroup>

          <div className="sticky bottom-0 -mx-5 flex gap-2 border-t border-line bg-paper px-5 py-4 lg:hidden">
            <Link href={clearHref} onClick={() => setOpen(false)} className={buttonClasses("outline", "md", "flex-1")}>
              Цэвэрлэх
            </Link>
            <Button type="submit" className="flex-1">Үр дүн харах</Button>
          </div>
          {active > 0 && (
            <Link href={clearHref} scroll={false} className="hidden text-sm text-muted underline underline-offset-4 hover:text-ink lg:inline-block">
              Шүүлтүүр цэвэрлэх
            </Link>
          )}
        </form>
      </aside>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3 !text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}

function Radio(props: { name: string; value: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1 text-[14px] text-ink-soft hover:text-ink">
      <input type="radio" name={props.name} value={props.value} defaultChecked={props.defaultChecked} className="peer sr-only" />
      <span className="size-3.5 rounded-full border border-taupe transition peer-checked:border-[4px] peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink/30" />
      <span className="peer-checked:font-medium peer-checked:text-ink">{props.label}</span>
    </label>
  );
}

function Checkbox(props: { name: string; value: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[14px] text-ink-soft hover:text-ink">
      <input type="checkbox" name={props.name} value={props.value} defaultChecked={props.defaultChecked}
        className="size-4 cursor-pointer rounded border-taupe accent-glow" />
      {props.label}
    </label>
  );
}

function Chip(props: { name: string; value: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="checkbox" name={props.name} value={props.value} defaultChecked={props.defaultChecked} className="peer sr-only" />
      <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-full border border-line bg-paper-deep px-3 font-mono text-[12px] transition-colors hover:border-sage peer-checked:border-glow peer-checked:bg-glow peer-checked:text-night peer-focus-visible:ring-2 peer-focus-visible:ring-glow/40">
        {props.label}
      </span>
    </label>
  );
}

/** Search box + sort dropdown shown above the product grid. */
export function ProductToolbar({ filters, basePath = "/products" }: { filters: ProductFilters; basePath?: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
      <form
        key={filters.q}
        role="search"
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
          router.push(`${basePath}${filtersToQuery({ ...filters, q, page: 1 })}`);
        }}
      >
        <label htmlFor="product-search" className="sr-only">Барааны нэрээр хайх</label>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-taupe" />
        <input id="product-search" name="q" type="search" defaultValue={filters.q} placeholder="Барааны нэрээр хайх…"
          className={cn(inputClasses, "pl-10")} enterKeyHint="search" />
      </form>
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="shrink-0 text-[13px] text-muted">Эрэмбэ:</label>
        <Select
          id="sort"
          value={filters.sort}
          onChange={(e) =>
            router.push(`${basePath}${filtersToQuery({ ...filters, sort: e.target.value as ProductFilters["sort"], page: 1 })}`, { scroll: false })
          }
          className="py-2 text-sm sm:w-52"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </div>
    </div>
  );
}

/** Picks the district whose centre is closest (km), or null if far from UB. */
function nearestDistrict(lat: number, lng: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  let best: { name: string; km: number } | null = null;
  for (const [name, [dLat, dLng]] of Object.entries(DISTRICT_CENTERS)) {
    // Haversine distance
    const a = Math.sin(rad(dLat - lat) / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(dLat)) * Math.sin(rad(dLng - lng) / 2) ** 2;
    const km = 6371 * 2 * Math.asin(Math.sqrt(a));
    if (!best || km < best.km) best = { name, km };
  }
  return best && best.km < 60 ? best.name : null;
}

/** "Миний ойролцоо": uses the device location to filter by the nearest district. */
function NearMeButton({ onFound }: { onFound: (district: string) => void }) {
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setMessage("Таны төхөөрөмж байршил тодорхойлох боломжгүй байна.");
      return;
    }
    setState("loading");
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState("idle");
        const district = nearestDistrict(pos.coords.latitude, pos.coords.longitude);
        if (district) onFound(district);
        else setMessage("Та Улаанбаатараас гадуур байна. Дүүргээ доороос сонгоно уу.");
      },
      (err) => {
        setState("idle");
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? "Байршлын зөвшөөрөл өгөөгүй байна. Дүүргээ доороос сонгоно уу."
            : "Байршил олдсонгүй. Дүүргээ доороос сонгоно уу.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={locate}
        disabled={state === "loading"}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-glow/60 px-3.5 text-[13px] font-medium text-glow transition-colors hover:bg-glow hover:text-night disabled:opacity-60"
      >
        {state === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
        Миний ойролцоо
      </button>
      {message ? (
        <p className="mt-2 text-[12px] text-rust" role="alert">{message}</p>
      ) : (
        <p className="mt-2 text-[12px] text-muted">Таны байршлаар хамгийн ойр дүүргийг сонгоно.</p>
      )}
    </div>
  );
}
