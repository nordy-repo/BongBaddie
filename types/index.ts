// Core domain types shared across the app, API routes, and services.

export type UUID = string;

export interface Collection {
  id: UUID;
  slug: string;
  name: string;
  description: string;
  coverImagePath: string; // storage path, resolved to a signed URL at render time
  itemCount: number;
  isPublished: boolean;
  createdAt: string;
}

export interface PhotoItem {
  id: UUID;
  collectionId: UUID;
  title: string;
  description: string;
  previewImagePath: string; // low-res / watermarked, safe to expose publicly
  fullImagePath: string; // original, NEVER exposed directly — only via signed URL after unlock
  priceCents: number;
  currency: string;
  tags: string[];
  uploadDate: string;
  locked: boolean;
}

// What the public-facing gallery is allowed to see before unlock.
export interface PublicPhotoItem {
  id: UUID;
  collectionId: UUID;
  title: string;
  description: string;
  previewUrl: string;
  price: string; // formatted, e.g. "$12.00"
  tags: string[];
  uploadDate: string;
  locked: boolean;
}

export type KeyScopeType = "item" | "collection";

export interface UnlockKey {
  id: UUID;
  // The raw key (e.g. "AB9X-4PKL-72QM") is never stored — only its salted hash.
  keyHash: string;
  keySalt: string;
  scopeType: KeyScopeType;
  scopeId: UUID; // photo item id or collection id, depending on scopeType
  isActive: boolean;
  maxUses: number;
  useCount: number;
  createdAt: string;
  expiresAt: string | null;
  note: string | null;
}

export interface UnlockEvent {
  id: UUID;
  keyId: UUID;
  scopeType: KeyScopeType;
  scopeId: UUID;
  ipHash: string; // hashed, never raw IP
  userAgent: string | null;
  success: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalCollections: number;
  totalItems: number;
  totalKeys: number;
  activeKeys: number;
  totalUnlocks: number;
  unlocksLast7Days: number;
}

export interface ApiError {
  error: string;
  code?: string;
}
