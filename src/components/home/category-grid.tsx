import Image from "@/components/ui/smart-image";
import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/products?category=${c.slug}`}
          className="shimmer group relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-line transition-shadow duration-500 hover:ring-glow/50 md:aspect-[3/4]"
        >
          {c.image_url && (
            <Image
              src={c.image_url}
              alt=""
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover transition-transform duration-[1000ms] ease-(--ease-soft) group-hover:scale-[1.05]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
            <h3 className="font-serif font-semibold tracking-tight text-base text-ink uppercase sm:text-lg">{c.name}</h3>
            <span className="grid size-8 translate-x-1 place-items-center rounded-full bg-glow text-night opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true">
              →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
