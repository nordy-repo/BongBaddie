import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getSignedPreviewUrl } from "@/lib/services/storage";
import type { Collection } from "@/types";

export async function listPublishedCollections(): Promise<Collection[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, cover_image_path, item_count, is_published, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return Promise.all(
    (data ?? []).map(async (row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      coverImagePath: await getSignedPreviewUrl(row.cover_image_path),
      itemCount: row.item_count,
      isPublished: row.is_published,
      createdAt: row.created_at,
    }))
  );
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, cover_image_path, item_count, is_published, created_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    coverImagePath: await getSignedPreviewUrl(data.cover_image_path),
    itemCount: data.item_count,
    isPublished: data.is_published,
    createdAt: data.created_at,
  };
}

export async function adminCreateCollection(input: {
  slug: string;
  name: string;
  description: string;
  coverImagePath: string;
}) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("collections")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}