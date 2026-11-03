import Link from "next/link";
import { ShopModeration } from "@/components/dashboard/shop-moderation";
import { ShopStatusBadge } from "@/components/dashboard/status-badge";
import { ShopLogo } from "@/components/shop/shop-card";
import { Badge } from "@/components/ui/misc";
import type { AdminShop } from "@/lib/data/admin";
import { formatDate, formatPhone } from "@/lib/format";

export function AdminShopRow({ shop }: { shop: AdminShop }) {
  return (
    <li className="flex flex-col gap-4 py-5 md:flex-row md:items-start">
      <ShopLogo shop={shop} className="size-12 text-base ring-0" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {shop.status === "approved" ? (
            <Link href={`/shops/${shop.id}`} className="font-serif font-semibold tracking-tight text-base hover:underline">{shop.name}</Link>
          ) : (
            <span className="font-serif font-semibold tracking-tight text-base">{shop.name}</span>
          )}
          <ShopStatusBadge status={shop.status} />
          {shop.is_demo && <Badge>Демо</Badge>}
        </div>
        <p className="mt-1 text-[13px] text-muted">
          {shop.owner?.full_name || "Эзэмшигчгүй"} · {formatPhone(shop.phone)} · {shop.district ? `${shop.district}, ` : ""}{shop.address}
        </p>
        <p className="mt-0.5 text-[13px] text-muted">
          Бүртгүүлсэн: {formatDate(shop.created_at)} · {shop.products?.[0]?.count ?? 0} бараа
          {shop.instagram_url && (
            <> · <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Instagram</a></>
          )}
          {shop.facebook_url && (
            <> · <a href={shop.facebook_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Facebook</a></>
          )}
        </p>
        {shop.description && <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-ink-soft">{shop.description}</p>}
      </div>
      <ShopModeration shopId={shop.id} status={shop.status} />
    </li>
  );
}
