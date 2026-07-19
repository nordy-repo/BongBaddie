// Server-side Supabase clients.
//
// `createServerClient` — cookie-bound client for use in Server Components,
// Route Handlers, and Server Actions. Respects RLS as the logged-in user
// (or anonymous visitor).
//
// `createAdminClient` — uses the SERVICE ROLE key, which bypasses RLS.
// This must NEVER be imported into any file that ships to the browser.
// Only use it inside app/api/admin/** route handlers, after verifying the
// caller is an authenticated admin (see lib/auth.ts).

import { createServerClient as createSSRClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore because
            // middleware refreshes the session on navigation.
          }
        },
      },
    }
  );
}

export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient must never be called from the browser.");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
