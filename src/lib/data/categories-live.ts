import "server-only";
import { DEMO_CATEGORIES } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

/** Uncached category list for dashboard forms and the admin page. */
export async function getCategoriesLive(): Promise<Category[]> {
  if (!isSupabaseConfigured) return DEMO_CATEGORIES;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,image_url,sort_order")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(`Ангилал ачаалж чадсангүй: ${error.message}`);
  return data as Category[];
}
