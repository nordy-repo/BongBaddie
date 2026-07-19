import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { DashboardShell } from "./dashboard-shell";
import type { AdminStats } from "@/types";

async function getStats(): Promise<AdminStats> {
  const supabase = createAdminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [collections, items, keys, activeKeys, unlocks, recentUnlocks] = await Promise.all([
    supabase.from("collections").select("id", { count: "exact", head: true }),
    supabase.from("photo_items").select("id", { count: "exact", head: true }),
    supabase.from("unlock_keys").select("id", { count: "exact", head: true }),
    supabase.from("unlock_keys").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("unlock_events").select("id", { count: "exact", head: true }).eq("success", true),
    supabase
      .from("unlock_events")
      .select("id", { count: "exact", head: true })
      .eq("success", true)
      .gte("created_at", sevenDaysAgo),
  ]);

  return {
    totalCollections: collections.count ?? 0,
    totalItems: items.count ?? 0,
    totalKeys: keys.count ?? 0,
    activeKeys: activeKeys.count ?? 0,
    totalUnlocks: unlocks.count ?? 0,
    unlocksLast7Days: recentUnlocks.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const stats = await getStats();

  return <DashboardShell stats={stats} adminEmail={user?.email ?? ""} />;
}
