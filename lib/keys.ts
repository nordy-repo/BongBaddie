// Unlock key generation, hashing, and verification.
//
// Design:
//   - Raw keys look like "AB9X-4PKL-72QM" and are shown to the admin exactly
//     once, at creation time. They are never persisted anywhere in plaintext.
//   - We store only a salted SHA-256 hash (salt is random per key, plus a
//     server-side pepper from KEY_HASH_PEPPER). This means a database leak
//     alone is not enough to recover working keys.
//   - Verification is constant-time to avoid timing side-channels.
//
// A cryptographically stronger option (Argon2/bcrypt) is possible, but for
// short, high-entropy, random tokens like these, a peppered/salted SHA-256
// is standard practice and keeps the API route fast under rate limiting.

import { randomBytes, timingSafeEqual, createHash } from "crypto";

const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid ambiguity
const GROUP_LENGTH = 4;
const GROUP_COUNT = 3;

export function generateRawKey(): string {
  const groups: string[] = [];
  for (let g = 0; g < GROUP_COUNT; g++) {
    let group = "";
    const bytes = randomBytes(GROUP_LENGTH);
    for (let i = 0; i < GROUP_LENGTH; i++) {
      group += KEY_ALPHABET[bytes[i]! % KEY_ALPHABET.length];
    }
    groups.push(group);
  }
  return groups.join("-");
}

export function normalizeKeyInput(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function hashKey(rawKey: string, salt: string): string {
  const pepper = process.env.KEY_HASH_PEPPER ?? "";
  if (!pepper) {
    throw new Error("KEY_HASH_PEPPER is not configured.");
  }
  return createHash("sha256").update(`${salt}:${pepper}:${rawKey}`).digest("hex");
}

export function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

export function verifyKey(rawKey: string, salt: string, expectedHash: string): boolean {
  const candidate = hashKey(normalizeKeyInput(rawKey), salt);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(expectedHash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Creates a new key pair ready to insert into the database, plus the raw key to show once. */
export function createUnlockKey() {
  const raw = generateRawKey();
  const salt = generateSalt();
  const keyHash = hashKey(raw, salt);
  return { raw, salt, keyHash };
}
