import { Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { phoneHref } from "@/lib/format";
import type { Shop } from "@/lib/types";

/**
 * Instagram / Facebook / phone buttons. A button only renders when the shop
 * actually has that contact, so there are never dead buttons.
 */
export function ContactButtons({
  shop,
  layout = "stack",
}: {
  shop: Pick<Shop, "instagram_url" | "facebook_url" | "phone" | "name">;
  layout?: "stack" | "row";
}) {
  const tel = shop.phone ? phoneHref(shop.phone) : null;
  const wrap = layout === "stack" ? "flex flex-col gap-2.5" : "flex flex-wrap gap-2.5";

  if (!shop.instagram_url && !shop.facebook_url && !tel) {
    return <p className="text-sm text-muted">Энэ дэлгүүр холбоо барих мэдээлэл оруулаагүй байна.</p>;
  }

  return (
    <div className={wrap}>
      {shop.instagram_url && (
        <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "lg", layout === "stack" ? "w-full" : "")}>
          <InstagramIcon className="size-[18px]" /> Instagram-аар холбогдох
        </a>
      )}
      {shop.facebook_url && (
        <a href={shop.facebook_url} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline", "lg", layout === "stack" ? "w-full" : "")}>
          <FacebookIcon className="size-[18px]" /> Facebook-ээр холбогдох
        </a>
      )}
      {tel && (
        <a href={tel} className={buttonClasses("outline", "lg", layout === "stack" ? "w-full" : "")}>
          <Phone className="size-[18px]" strokeWidth={1.75} /> Утсаар холбогдох
        </a>
      )}
    </div>
  );
}
