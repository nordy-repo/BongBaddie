import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { createUnlockKey } from "@/lib/keys";

const CreateKeySchema = z.object({
  scopeType: z.enum(["item", "collection"]),
  scopeId: z.string().uuid(),
  maxUses: z.number().int().min(1).max(100).default(1),
  expiresAt: z.string().datetime().nullable().optional(),
  note: z.string().max(280).optional(),
});

export async function GET(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();

  let query = supabase
    .from("unlock_keys")
    .select("id, key_prefix, scope_type, scope_id, is_active, max_uses, use_count, created_at, expires_at, note")
    .order("created_at", { ascending: false })
    .limit(200);

  if (search) {
    query = query.ilike("key_prefix", `%${search.toUpperCase()}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ keys: data });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = CreateKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { raw, salt, keyHash } = createUnlockKey();
  const prefix = raw.split("-")[0];

  const { error } = await supabase.from("unlock_keys").insert({
    key_hash: keyHash,
    key_salt: salt,
    key_prefix: prefix,
    scope_type: parsed.data.scopeType,
    scope_id: parsed.data.scopeId,
    max_uses: parsed.data.maxUses,
    expires_at: parsed.data.expiresAt ?? null,
    note: parsed.data.note ?? null,
    is_active: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ key: raw }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const schema = z.object({ id: z.string().uuid(), isActive: z.boolean() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("unlock_keys")
    .update({ is_active: parsed.data.isActive })
    .eq("id", parsed.data.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
