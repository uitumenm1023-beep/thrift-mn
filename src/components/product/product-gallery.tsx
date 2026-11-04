"use client";

import Image from "@/components/ui/smart-image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Shirt } from "lucide-react";
import { cn } from "@/lib/format";

export function ProductGallery({ images, alt, dimmed }: { images: string[]; alt: string; dimmed?: boolean }) {
  const [index, setIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="grid aspect-[4/5] place-items-center rounded-xl bg-paper-deep">
        <Shirt className="size-16 text-taupe/50" strokeWidth={1} />
      </div>
    );
  }

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto md:w-20 md:flex-col md:overflow-visible" role="tablist" aria-label="Зургууд">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${i + 1}-р зураг`}
              onClick={() => setIndex(i)}
              className={cn(
                "relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl transition-opacity md:w-full",
                i === index ? "ring-2 ring-glow ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100",
              )}
            >
              <Image thumb src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        className="group relative aspect-[4/5] flex-1 overflow-hidden rounded-xl bg-paper-deep"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === 0 ? alt : `${alt} — ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 55vw, 100vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              i === index ? "opacity-100" : "opacity-0",
              dimmed && "grayscale-[30%]",
            )}
          />
        ))}
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Өмнөх зураг"
              className="absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/85 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Дараагийн зураг"
              className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/85 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100">
              <ChevronRight className="size-5" />
            </button>
            <p className="absolute right-3 bottom-3 rounded-xl bg-paper/85 px-2 py-0.5 text-[12px] tabular-nums backdrop-blur">
              {index + 1} / {images.length}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
