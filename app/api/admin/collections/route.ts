import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const CreateCollectionSchema = z.object({
  slug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  name: z.string().min(2).max(120),
  description: z.string().max(1000),
  coverImagePath: z.string().min(1),
});

const UpdateCollectionSchema = CreateCollectionSchema.partial().extend({
  id: z.string().uuid(),
  isPublished: z.boolean().optional(),
});

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, cover_image_path, item_count, is_published, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ collections: data });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = CreateCollectionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("collections")
    .insert({
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description,
      cover_image_path: parsed.data.coverImagePath,
      is_published: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ collection: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = UpdateCollectionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { id, ...rest } = parsed.data;
  const updates: Record<string, unknown> = {};
  if (rest.slug !== undefined) updates.slug = rest.slug;
  if (rest.name !== undefined) updates.name = rest.name;
  if (rest.description !== undefined) updates.description = rest.description;
  if (rest.coverImagePath !== undefined) updates.cover_image_path = rest.coverImagePath;
  if (rest.isPublished !== undefined) updates.is_published = rest.isPublished;

  const supabase = createAdminClient();
  const { error } = await supabase.from("collections").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
