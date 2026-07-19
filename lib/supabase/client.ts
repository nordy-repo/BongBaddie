// Browser-side Supabase client.
// Uses only the public anon key — safe to ship to the client.
// Row Level Security (see supabase/schema.sql) is what actually protects data,
// not the fact that this key is "anon".

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
