import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Shop, UserRole } from "@/lib/types";

export interface CurrentUser {
  id: string;
  email: string;
  profile: Profile;
}

/**
 * The signed-in user and their profile, verified with Supabase Auth.
 * Wrapped in React cache() so it runs once per request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,full_name,role,created_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  return { id: user.id, email: user.email ?? "", profile: profile as Profile };
});

export function homeForRole(role: UserRole) {
  if (role === "admin") return "/admin";
  if (role === "shop_owner") return "/dashboard";
  return "/";
}

/** Redirects unless the current user has the given role. */
export async function requireRole(role: Exclude<UserRole, "customer">) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${role === "admin" ? "/admin" : "/dashboard"}`);
  if (user.profile.role !== role) redirect(`/login?denied=1`);
  return user;
}

/** The shop owned by the signed-in shop owner (null if none yet). */
export const getOwnShop = cache(async (): Promise<Shop | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("shops").select("*").eq("owner_id", user.id).maybeSingle();
  return (data as Shop | null) ?? null;
});
