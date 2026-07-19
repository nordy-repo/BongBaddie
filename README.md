# BongBaddie

A premium creator portfolio: visitors browse collections and free previews, and unlock full-resolution
purchased content with a unique access key issued by the creator after a purchase made outside the site
(no subscriptions, no in-app payments).

## Stack

Next.js 15 (App Router) · React · TypeScript · Tailwind CSS · Framer Motion · shadcn/ui-style components ·
Lucide Icons · Supabase (Postgres + Auth + Storage) · deployed on Vercel.

## How it works

- **Browsing is free.** Collections and preview images are public and served straight from Supabase, protected
  by Row Level Security (`is_published = true`).
- **Premium images are never exposed.** The database keeps a `full_image_path` column that is only ever read by
  the service-role client, and only after a key has been cryptographically verified. Every image the browser
  sees — preview or full — is a short-lived Supabase Storage **signed URL**, generated on demand.
- **Keys are single-use-configurable, hashed, and salted.** A key like `AB9X-4PKL-72QM` is shown to the admin
  exactly once at creation. The database stores only `sha256(salt + pepper + key)` — never the key itself. See
  `lib/keys.ts`.
- **Every unlock attempt is rate-limited and logged**, success or failure, with a hashed IP (see
  `lib/rate-limit.ts`, `lib/services/unlock.ts`, and the `unlock_events` table).

## Project structure

```
app/
  page.tsx                 Homepage (hero + featured + latest)
  about/                   Creator bio + socials
  collections/              Collections grid
  collections/[slug]/       Pinterest-style gallery for one collection
  unlock/                   Key entry + reveal
  admin/login/              Creator sign-in
  admin/dashboard/          Stats, collection & key management
  api/unlock/                Public: verify a key, return signed URLs
  api/admin/login/           Admin sign-in
  api/admin/collections/     Admin: CRUD collections
  api/admin/keys/            Admin: generate/list/deactivate keys
  api/admin/upload/          Admin: upload images to Storage
components/
  ui/                       Button, Card, Input, Badge, Dialog primitives
  navbar.tsx, footer.tsx, hero.tsx, collection-card.tsx,
  photo-tile.tsx, locked-modal.tsx, unlock-card.tsx
lib/
  supabase/                 Browser / server / admin (service-role) clients
  services/                 Data-access layer (collections, photos, unlock, storage)
  keys.ts                   Key generation, hashing, constant-time verification
  rate-limit.ts             In-memory sliding-window limiter
  utils.ts
types/index.ts              Shared domain types
supabase/schema.sql          Tables, RLS policies, triggers, storage bucket notes
supabase/seed.sql            Sample data
middleware.ts                Session refresh + /admin route protection
```

## Setup

1. **Create a Supabase project.** In the SQL editor, run `supabase/schema.sql`, then (optionally, for local
   testing) `supabase/seed.sql`.
2. **Create two Storage buckets**, both **private**:
   - `previews` — watermarked / lower-resolution images shown to everyone
   - `full` — original, unwatermarked images, only ever reached through a signed URL after a verified unlock
3. **Create an admin user** in Supabase Auth (Authentication → Users → Add user). This is the only login the
   `/admin` dashboard accepts — there's no public sign-up route by design.
4. **Copy `.env.example` to `.env.local`** and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase → Project Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY` — same page. **Server-only. Never prefix this with `NEXT_PUBLIC_`.**
   - `KEY_HASH_PEPPER` — a long random string, e.g. `openssl rand -hex 32`. Losing this invalidates every issued key.
5. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```
6. Visit `/admin/login`, sign in, create a collection, upload images to the `previews` and `full` buckets
   (via the Supabase dashboard or the `/api/admin/upload` route), then create photo items referencing those
   paths, and generate keys from the **Keys** tab.

## Deployment (Vercel)

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Add the same environment variables from `.env.local` in Vercel → Project → Settings → Environment Variables.
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain (used for metadata, Open Graph, and the sitemap).
4. Deploy. Vercel builds with `next build` automatically.

**Rate limiting note:** `lib/rate-limit.ts` uses in-memory counters, which reset per serverless instance. For
strict multi-region rate limiting in production, swap it for a shared store (Upstash Redis is the common
Vercel-native option) — the call sites in `app/api/unlock/route.ts` and `app/api/admin/login/route.ts` don't
need to change.

## Security checklist

- [x] RLS enabled on every table; `unlock_keys` and `unlock_events` have **no** anon/authenticated policies at all
- [x] Full-resolution image paths are never sent to the browser directly — only signed URLs, generated server-side
- [x] Keys are salted + peppered + hashed; raw keys exist only in the HTTP response at creation time and in the
      buyer's inbox
- [x] Key verification is constant-time (`crypto.timingSafeEqual`)
- [x] `/api/unlock` and `/api/admin/login` are rate-limited per IP (hashed, not stored raw)
- [x] `/admin/**` and `/api/admin/**` require an authenticated Supabase session (`middleware.ts`)
- [x] All admin writes go through the service-role client, called only from server-only route handlers
- [x] Zod validates every API request body before it touches the database

## What's stubbed vs. real

Everything above is real, working application code. Two things are intentionally left as extension points
rather than fully built out, since they're operational tooling rather than core product surface:

- The **Collections → Manage Existing** panel in the dashboard describes rather than implements inline
  edit/publish/delete — the API (`PATCH`/`DELETE /api/admin/collections`) is complete; it just needs a table UI.
- The **Unlock History** tab points at querying `unlock_events` directly in Supabase, or adding a
  `GET /api/admin/history` route mirroring `/api/admin/keys`.

Both are a small, mechanical amount of work on top of finished endpoints — flagging them so nothing is presented
as more finished than it is.
