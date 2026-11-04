import Image from "@/components/ui/smart-image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { ShopCover } from "@/components/shop/shop-cover";
import { cn, initials, isMapLink } from "@/lib/format";
import type { Shop, ShopWithCount } from "@/lib/types";

export function ShopLogo({
  shop,
  className,
  sizes = "64px",
}: {
  shop: Pick<Shop, "name" | "logo_url">;
  className?: string;
  sizes?: string;
}) {
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-moss text-ink ring-4 ring-paper",
        className,
      )}
    >
      {shop.logo_url ? (
        <Image thumb src={shop.logo_url} alt={`${shop.name} лого`} fill sizes={sizes} className="object-cover" />
      ) : (
        <span className="font-display text-[0.8em] font-bold" aria-hidden="true">
          {initials(shop.name)}
        </span>
      )}
    </div>
  );
}

export function ShopCard({ shop }: { shop: ShopWithCount }) {
  return (
    <article className="group min-w-0">
      <Link href={`/shops/${shop.id}`} className="block">
        <div className={cn("relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-line transition-shadow duration-500 group-hover:ring-glow/40", shop.cover_url && "shimmer")}>
          <ShopCover
            shop={shop}
            thumb
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            imageClassName="transition-transform duration-[900ms] ease-(--ease-soft) group-hover:scale-[1.04]"
          />
          {shop.is_demo && (
            <span className="absolute top-3 left-3 rounded-full bg-night/70 px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.12em] text-ink-soft uppercase backdrop-blur">
              Демо
            </span>
          )}
        </div>
        <div className="relative -mt-7 flex items-end gap-3 px-4">
          <ShopLogo shop={shop} className="size-14 text-lg" />
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif font-semibold tracking-tight text-lg leading-tight break-words">{shop.name}</h3>
            <p className="mt-1.5 flex items-center gap-1 text-[13px] text-muted">
              <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">
                {shop.district ? `${shop.district} дүүрэг` : isMapLink(shop.address) ? "Газрын зураг дээр" : shop.address}
              </span>
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">
              {shop.available_count > 0 ? `${shop.available_count} бараа худалдаанд` : "Удахгүй бараа нэмэгдэнэ"}
            </p>
          </div>
          <span className="mt-1 inline-flex shrink-0 items-center gap-1 border-b border-ink/30 pb-0.5 text-[13px] font-medium transition-colors group-hover:border-glow group-hover:text-glow">
            Дэлгүүр үзэх <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
