import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import { getSignedPreviewUrl } from "@/lib/services/storage";
import { formatPrice } from "@/lib/utils";
import type { PublicPhotoItem } from "@/types";

export async function listPhotosForCollection(collectionId: string): Promise<PublicPhotoItem[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("photo_items")
    .select("id, collection_id, title, description, preview_image_path, price_cents, currency, tags, upload_date, locked")
    .eq("collection_id", collectionId)
    .order("upload_date", { ascending: false });

  if (error) throw new Error(error.message);

  return Promise.all(
    (data ?? []).map(async (row) => ({
      id: row.id,
      collectionId: row.collection_id,
      title: row.title,
      description: row.description,
      previewUrl: await getSignedPreviewUrl(row.preview_image_path),
      price: formatPrice(row.price_cents, row.currency),
      tags: row.tags ?? [],
      uploadDate: row.upload_date,
      locked: row.locked,
    }))
  );
}

// Admin-only: full record including the private full-image path.
export async function adminCreatePhotoItem(input: {
  collectionId: string;
  title: string;
  description: string;
  previewImagePath: string;
  fullImagePath: string;
  priceCents: number;
  currency: string;
  tags: string[];
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("photo_items")
    .insert({
      collection_id: input.collectionId,
      title: input.title,
      description: input.description,
      preview_image_path: input.previewImagePath,
      full_image_path: input.fullImagePath,
      price_cents: input.priceCents,
      currency: input.currency,
      tags: input.tags,
      locked: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
