// Handles image uploads from the admin dashboard.
// All files are stored in the "content" bucket.
// Preview images are saved under:
//   previews/YYYY-MM-DD/<random>.jpg
// Full-resolution images are saved under:
//   full/YYYY-MM-DD/<random>.jpg

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const type = formData.get("bucket"); // "previews" or "full"

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (type !== "previews" && type !== "full") {
    return NextResponse.json(
      { error: "Invalid upload type." },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, or WebP images are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File exceeds the 15MB limit." },
      { status: 400 }
    );
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
      ? "webp"
      : "jpg";

  const folder =
    type === "previews"
      ? "previews"
      : "full";

  const path = `${folder}/${new Date()
    .toISOString()
    .slice(0, 10)}/${nanoid(12)}.${ext}`;

  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from("content")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ path }, { status: 201 });
}
