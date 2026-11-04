import Image from "@/components/ui/smart-image";
import { cn } from "@/lib/format";
import type { Shop } from "@/lib/types";

// Brand greens for generated covers; each shop gets one based on its name.
const TONES = ["#1e3a2e", "#2f4a3a", "#3e5a3f", "#3d4337", "#24432f"];

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return h;
}

/**
 * A shop's cover photo, or, when it has none, a generated cover in the brand
 * style: a green tone picked from the shop name, the name set large, and a
 * clothes rail with hangers. Fills its (positioned) parent.
 */
export function ShopCover({
  shop,
  sizes,
  priority,
  thumb,
  imageClassName,
}: {
  shop: Pick<Shop, "name" | "cover_url">;
  sizes: string;
  priority?: boolean;
  thumb?: boolean;
  imageClassName?: string;
}) {
  if (shop.cover_url) {
    return (
      <Image
        thumb={thumb}
        src={shop.cover_url}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", imageClassName)}
      />
    );
  }

  const h = hash(shop.name);
  const tone = TONES[h % TONES.length];
  // Hanger position varies a little per shop so covers don't look identical.
  const shift = (h % 5) * 9;

  return (
    <div
      aria-hidden="true"
      className={cn("grain absolute inset-0 overflow-hidden [container-type:size]", imageClassName)}
      style={{
        background: `radial-gradient(70% 60% at 15% 0%, rgb(216 240 106 / 0.16), transparent 70%), radial-gradient(60% 50% at 100% 100%, rgb(0 0 0 / 0.25), transparent 70%), ${tone}`,
      }}
    >
      {/* Clothes rail across the top, with three hangers at a fixed size */}
      <div className="absolute inset-x-0 top-[18%] h-[3px] rounded-full bg-ink/20" />
      <svg
        viewBox="0 0 236 64"
        className="absolute top-[18%] -translate-y-[6px]"
        style={{ left: `${8 + shift}%`, width: "clamp(150px, 34cqw, 260px)" }}
      >
        {[30, 110, 190].map((x, i) => (
          <g key={x} stroke={i === 1 ? "#d8f06a" : "#e6e9da"} strokeOpacity={i === 1 ? 0.8 : 0.3} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={`M${x} 6 c0 -9 11 -9 11 -2 c0 5 -5.5 6 -5.5 12`} />
            <path d={`M${x + 5.5} 16 L${x - 28} 40 L${x + 39} 40 Z`} />
          </g>
        ))}
      </svg>
      {/* Shop name, set large as a graphic */}
      <p
        className="absolute bottom-[-0.12em] left-[0.25em] max-w-[200%] font-display font-extrabold tracking-tighter whitespace-nowrap text-ink uppercase opacity-[0.12]"
        style={{ fontSize: "clamp(2.5rem, 24cqw, 14rem)", lineHeight: 1 }}
      >
        {shop.name}
      </p>
    </div>
  );
}
