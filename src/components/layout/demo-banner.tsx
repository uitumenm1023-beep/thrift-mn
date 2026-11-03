import { Info } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Shown at the top of every page while Supabase is not configured. */
export function DemoBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="bg-sand/70 text-ink-soft">
      <p className="mx-auto flex max-w-[1320px] items-center justify-center gap-2 px-5 py-2 text-center text-[12.5px]">
        <Info className="size-3.5 shrink-0" />
        <span>
          <strong className="font-medium">Демо горим:</strong> Supabase холбогдоогүй тул жишээ өгөгдөл
          харуулж байна. Тохируулах заавар README.md файлд бий.
        </span>
      </p>
    </div>
  );
}
