// Minimal in-memory sliding-window rate limiter.
//
// This is sufficient for a single-instance deployment or as a first line of
// defense. On Vercel's multi-region/serverless deployment, each cold
// instance has its own memory, so for strict guarantees pair this with a
// shared store (Upstash Redis is the common Vercel-native choice) — swap
// the Map below for a Redis-backed counter without changing the call sites.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

export function hashIp(ip: string): string {
  // Avoid storing raw IPs anywhere, including unlock_events.
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
