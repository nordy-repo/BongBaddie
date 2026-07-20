// Handles image uploads from the admin dashboard.
// All images are stored in the "content" bucket.
// Preview images:
//   content/previews/YYYY-MM-DD/<random>.jpg
// Full images:
//   content/full/YYYY-MM-DD/<random>.jpg

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const folder = formData.get("bucket"); // "previews" or "full"

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    if (folder !== "previews" && folder !== "full") {
      return NextResponse.json(
        { error: "Invalid upload folder." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Only JPEG, PNG, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        {
          error: "File exceeds the 15MB limit.",
        },
        { status: 400 }
      );
    }

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
        ? "webp"
        : "jpg";

    const date = new Date().toISOString().slice(0, 10);

    const path = `${folder}/${date}/${nanoid(12)}.${ext}`;

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

    return NextResponse.json(
      {
        success: true,
        bucket: "content",
        path,
      },
      { status: 201 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upload failed.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
