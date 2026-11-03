"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";

/** Shared body for error.tsx boundaries. */
export function ErrorContent({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={TriangleAlert}
      title="Алдаа гарлаа"
      description={
        <>
          Хуудсыг ачаалах үед алдаа гарлаа. Дахин оролдоно уу.
          {error.digest && <span className="mt-2 block text-[12px] text-taupe">Код: {error.digest}</span>}
        </>
      }
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Дахин оролдох</Button>
          <ButtonLink href="/" variant="outline">Нүүр хуудас</ButtonLink>
        </div>
      }
    />
  );
}
