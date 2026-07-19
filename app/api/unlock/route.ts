import { NextResponse } from "next/server";
import { z } from "zod";
import { attemptUnlock } from "@/lib/services/unlock";
import { rateLimit, getClientIp, hashIp } from "@/lib/rate-limit";

const UnlockSchema = z.object({
  key: z.string().min(6).max(32),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const ipHash = hashIp(ip);

  const rl = rateLimit(`unlock:${ipHash}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later.", code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = UnlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid unlock key." }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent");

  try {
    const result = await attemptUnlock(parsed.data.key, ipHash, userAgent);

    if (!result.success) {
      const messages: Record<string, string> = {
        invalid_key: "That key doesn't match anything in our records.",
        inactive_key: "This key has been deactivated.",
        expired_key: "This key has expired.",
        exhausted_key: "This key has already been used.",
      };
      return NextResponse.json(
        { error: messages[result.reason ?? "invalid_key"] },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scopeType: result.scopeType,
      scopeName: result.scopeName,
      imageUrls: result.unlockedImageUrls,
    });
  } catch (err) {
    console.error("Unlock error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
