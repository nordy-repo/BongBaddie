// The single place where an unlock key is checked against the database and,
// if valid, turned into a short-lived signed URL to the real image(s).
//
// Called only from app/api/unlock/route.ts (server-side). Never import this
// into client components.

import { createAdminClient } from "@/lib/supabase/server";
import { normalizeKeyInput, verifyKey } from "@/lib/keys";
import { getSignedFullUrl } from "@/lib/services/storage";

export interface UnlockResult {
  success: boolean;
  reason?: "invalid_key" | "inactive_key" | "expired_key" | "exhausted_key";
  unlockedImageUrls?: string[];
  scopeType?: "item" | "collection";
  scopeName?: string;
}

export async function attemptUnlock(rawKeyInput: string, ipHash: string, userAgent: string | null): Promise<UnlockResult> {
  const supabase = createAdminClient();
  const normalized = normalizeKeyInput(rawKeyInput);

  // Keys are looked up by a non-secret prefix index (first group, e.g. "AB9X")
  // so we don't have to hash-compare against every row in the table.
  const prefix = normalized.split("-")[0] ?? "";

  const { data: candidates, error } = await supabase
    .from("unlock_keys")
    .select("id, key_hash, key_salt, scope_type, scope_id, is_active, max_uses, use_count, expires_at")
    .eq("key_prefix", prefix);

  if (error) throw new Error(error.message);

  const match = (candidates ?? []).find((row) => verifyKey(normalized, row.key_salt, row.key_hash));

  const logEvent = async (success: boolean, keyId: string | null, scopeType: string | null, scopeId: string | null) => {
    await supabase.from("unlock_events").insert({
      key_id: keyId,
      scope_type: scopeType,
      scope_id: scopeId,
      ip_hash: ipHash,
      user_agent: userAgent,
      success,
    });
  };

  if (!match) {
    await logEvent(false, null, null, null);
    return { success: false, reason: "invalid_key" };
  }

  if (!match.is_active) {
    await logEvent(false, match.id, match.scope_type, match.scope_id);
    return { success: false, reason: "inactive_key" };
  }

  if (match.expires_at && new Date(match.expires_at) < new Date()) {
    await logEvent(false, match.id, match.scope_type, match.scope_id);
    return { success: false, reason: "expired_key" };
  }

  if (match.use_count >= match.max_uses) {
    await logEvent(false, match.id, match.scope_type, match.scope_id);
    return { success: false, reason: "exhausted_key" };
  }

  // Valid — resolve what it unlocks.
  let imagePaths: string[] = [];
  let scopeName = "";

  if (match.scope_type === "item") {
    const { data: item } = await supabase
      .from("photo_items")
      .select("full_image_path, title")
      .eq("id", match.scope_id)
      .single();
    if (item) {
      imagePaths = [item.full_image_path];
      scopeName = item.title;
    }
  } else {
    const { data: items } = await supabase
      .from("photo_items")
      .select("full_image_path")
      .eq("collection_id", match.scope_id);
    const { data: collection } = await supabase
      .from("collections")
      .select("name")
      .eq("id", match.scope_id)
      .single();
    imagePaths = (items ?? []).map((i) => i.full_image_path);
    scopeName = collection?.name ?? "Collection";
  }

  const unlockedImageUrls = await Promise.all(imagePaths.map((p) => getSignedFullUrl(p)));

  await supabase
    .from("unlock_keys")
    .update({ use_count: match.use_count + 1 })
    .eq("id", match.id);

  await logEvent(true, match.id, match.scope_type, match.scope_id);

  return {
    success: true,
    unlockedImageUrls,
    scopeType: match.scope_type,
    scopeName,
  };
}
