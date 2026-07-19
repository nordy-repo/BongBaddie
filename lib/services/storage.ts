// Every image URL that reaches the browser is a short-lived signed URL.

import { createAdminClient } from "@/lib/supabase/server";

const CONTENT_BUCKET = "content";

const PREVIEW_URL_TTL_SECONDS = 60 * 30;
const FULL_URL_TTL_SECONDS = 60 * 10;

export async function getSignedPreviewUrl(path: string): Promise<string> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(CONTENT_BUCKET)
    .createSignedUrl(path, PREVIEW_URL_TTL_SECONDS);

  if (error || !data) {
    throw new Error(`Failed to sign preview URL: ${error?.message}`);
  }

  return data.signedUrl;
}

export async function getSignedFullUrl(path: string): Promise<string> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(CONTENT_BUCKET)
    .createSignedUrl(path, FULL_URL_TTL_SECONDS);

  if (error || !data) {
    throw new Error(`Failed to sign full-image URL: ${error?.message}`);
  }

  return data.signedUrl;
}

export async function uploadToBucket(
  folder: "previews" | "full",
  path: string,
  file: File | Blob
) {
  const supabase = createAdminClient();

  const fullPath = `${folder}/${path}`;

  const { error } = await supabase.storage
    .from(CONTENT_BUCKET)
    .upload(fullPath, file, {
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return fullPath;
}