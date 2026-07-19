// Handles creating photo_items rows from the admin upload page.
// Files themselves are uploaded first via POST /api/admin/upload (which
// returns storage paths); this route just persists the resulting row.
// collections.item_count stays in sync automatically via the
// trg_sync_item_count trigger defined in supabase/schema.sql.

import { NextResponse } from "next/server";
import { z } from "zod";
import { adminCreatePhotoItem } from "@/lib/services/photos";

const CreatePhotoItemSchema = z.object({
  collectionId: z.string().uuid(),
  title: z.string().min(1).max(160),
  description: z.string().max(2000).default(""),
  previewImagePath: z.string().min(1),
  fullImagePath: z.string().min(1),
  priceCents: z.coerce.number().int().min(0).default(0),
  currency: z.string().min(3).max(3).default("USD"),
  tags: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = CreatePhotoItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const item = await adminCreatePhotoItem(parsed.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create photo item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
