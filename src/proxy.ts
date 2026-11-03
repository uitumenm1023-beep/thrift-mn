import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only pages that need a fresh session: dashboards, auth pages and the
  // auth callback. Public catalog pages stay fast and cacheable.
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register-shop", "/auth/:path*"],
};
