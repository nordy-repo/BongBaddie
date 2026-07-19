import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp, hashIp } from "@/lib/rate-limit";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const ipHash = hashIp(getClientIp(request));
  const rl = rateLimit(`admin-login:${ipHash}`, { limit: 8, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

if (error) {
  console.error("Supabase login error:", error);
  return NextResponse.json(
    {
      error: error.message,
      code: error.code,
      status: error.status,
    },
    { status: 401 }
  );
}

  return NextResponse.json({ success: true });
}
