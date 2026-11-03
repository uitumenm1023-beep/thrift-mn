"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { ACCEPT_ATTR, checkImageFile } from "@/lib/storage";
import { cn } from "@/lib/format";

/**
 * Picks one image and previews it locally. The parent uploads the file when
 * the form is submitted. `value` is the file chosen now, or null to clear,
 * or undefined to keep `initialUrl`.
 */
export function SingleImageInput({
  label,
  hint,
  initialUrl,
  shape = "circle",
  onChange,
}: {
  label: string;
  hint?: string;
  initialUrl?: string | null;
  shape?: "circle" | "wide";
  onChange: (value: File | null | undefined) => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const pick = (file: File | undefined) => {
    if (!file) return;
    const problem = checkImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const clear = () => {
    setPreview(null);
    onChange(initialUrl ? null : undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      <p id={`${id}-label`} className="text-[13px] font-medium text-ink-soft">{label}</p>
      <div className={cn("flex items-center gap-4", shape === "wide" && "flex-col items-stretch")}>
        <div
          className={cn(
            "relative grid shrink-0 place-items-center overflow-hidden border border-dashed border-taupe/50 bg-paper-deep",
            shape === "circle" ? "size-24 rounded-full" : "aspect-[3/1] w-full rounded-xl",
          )}
        >
          {preview ? (
            <Image src={preview} alt="" fill sizes={shape === "circle" ? "96px" : "600px"} className="object-cover" unoptimized={preview.startsWith("blob:")} />
          ) : (
            <ImagePlus className="size-6 text-taupe" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-9 rounded-xl border border-ink/70 px-3.5 text-[13px] font-medium transition-colors hover:border-glow hover:text-glow"
          >
            {preview ? "Солих" : "Зураг сонгох"}
          </button>
          {preview && (
            <button type="button" onClick={clear} className="inline-flex h-9 items-center gap-1 px-2 text-[13px] text-muted hover:text-rust">
              <X className="size-3.5" /> Арилгах
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        aria-labelledby={`${id}-label`}
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {error ? <p className="text-[13px] text-rust" role="alert">{error}</p> : hint && <p className="text-[12px] text-muted">{hint}</p>}
    </div>
  );
}
