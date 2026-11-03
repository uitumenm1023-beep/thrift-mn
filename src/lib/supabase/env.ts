// Public Supabase settings. Only the anon (publishable) key is used in this
// app — never put the service-role key in a NEXT_PUBLIC_ variable.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Supabase now calls this the "publishable" key (sb_publishable_...); older
// projects call it the "anon" key. Either variable name works.
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** False until both env variables are set. The app then runs in demo mode. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
