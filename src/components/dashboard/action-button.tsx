"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import type { ActionResult } from "@/lib/types";

type Variant = Parameters<typeof buttonClasses>[0];

/**
 * Runs a bound Server Action, optionally after a confirm step, and shows
 * pending and error states. The page refreshes when it succeeds.
 */
export function ActionButton({
  action,
  children,
  confirm,
  variant = "outline",
  className,
}: {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  confirm?: string;
  variant?: Variant;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = () =>
    start(async () => {
      setError(null);
      const result = await action();
      setAsking(false);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });

  if (asking) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-ink-soft">{confirm}</span>
        <button type="button" onClick={run} disabled={pending} className={buttonClasses(variant === "danger" ? "danger" : "primary", "sm")}>
          {pending && <LoaderCircle className="size-3.5 animate-spin" />} Тийм
        </button>
        <button type="button" onClick={() => setAsking(false)} disabled={pending} className={buttonClasses("ghost", "sm")}>
          Болих
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => (confirm ? setAsking(true) : run())}
        disabled={pending}
        className={buttonClasses(variant, "sm", className)}
      >
        {pending && <LoaderCircle className="size-3.5 animate-spin" />}
        {children}
      </button>
      {error && <span className="text-[12px] text-rust" role="alert">{error}</span>}
    </span>
  );
}
