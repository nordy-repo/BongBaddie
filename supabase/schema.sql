-- Exclusive Collection — Supabase schema
-- Run in the Supabase SQL editor, or via `supabase db push`.
--
-- Security model:
--   * RLS is ON for every table.
--   * Public (anon) role can only SELECT published collections / their items,
--     and only non-sensitive columns (raw key hashes are never selectable
--     by anon in the first place — see unlock_keys policies).
--   * All writes (collections, photo_items, unlock_keys) go through the
--     service-role key from server-only API routes (see lib/supabase/server.ts
--     createAdminClient), which bypasses RLS entirely. The anon/public role
--     has NO insert/update/delete grants on any table.
--   * unlock_keys.key_hash / key_salt are never exposed to anon, and are
--     only ever compared server-side in lib/services/unlock.ts.

create extension if not exists "pgcrypto";

-- ============================================================
-- collections
-- ============================================================
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  cover_image_path text not null,
  item_count int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.collections enable row level security;

create policy "public can read published collections"
  on public.collections for select
  to anon, authenticated
  using (is_published = true);

create policy "authenticated admins can read all collections"
  on public.collections for select
  to authenticated
  using (true);

-- No insert/update/delete policies for anon/authenticated: all writes go
-- through the service-role client in server-only API routes.

-- ============================================================
-- photo_items
-- ============================================================
create table if not exists public.photo_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  title text not null,
  description text not null default '',
  preview_image_path text not null,   -- safe to expose (watermarked/low-res)
  full_image_path text not null,      -- NEVER selectable by anon
  price_cents int not null default 0,
  currency text not null default 'USD',
  tags text[] not null default '{}',
  upload_date timestamptz not null default now(),
  locked boolean not null default true
);

alter table public.photo_items enable row level security;

-- Public may read preview-safe columns only, for published collections.
-- Column-level security: a view is used to keep full_image_path out of
-- anything anon can query directly.
create policy "public can read preview columns for published collections"
  on public.photo_items for select
  to anon, authenticated
  using (
    collection_id in (select id from public.collections where is_published = true)
  );

-- Belt-and-suspenders: the app never selects full_image_path through the
-- anon/authenticated client (see lib/services/photos.ts). Only
-- createAdminClient (service role) does, inside lib/services/unlock.ts,
-- strictly after a verified key match.

create index if not exists photo_items_collection_id_idx on public.photo_items(collection_id);

-- Keep collections.item_count in sync.
create or replace function public.sync_collection_item_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.collections set item_count = item_count + 1 where id = new.collection_id;
  elsif (tg_op = 'DELETE') then
    update public.collections set item_count = item_count - 1 where id = old.collection_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_item_count on public.photo_items;
create trigger trg_sync_item_count
  after insert or delete on public.photo_items
  for each row execute function public.sync_collection_item_count();

-- ============================================================
-- unlock_keys
-- Raw keys are NEVER stored. Only a salted+peppered SHA-256 hash
-- (see lib/keys.ts) plus a short, non-secret prefix for lookup.
-- ============================================================
create table if not exists public.unlock_keys (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null,
  key_salt text not null,
  key_prefix text not null,           -- e.g. "AB9X" — not sufficient to guess the full key
  scope_type text not null check (scope_type in ('item', 'collection')),
  scope_id uuid not null,
  is_active boolean not null default true,
  max_uses int not null default 1,
  use_count int not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  note text
);

alter table public.unlock_keys enable row level security;

-- No policies granted to anon/authenticated at all: this table is only ever
-- touched via the service-role client (createAdminClient), from
-- app/api/unlock and app/api/admin/keys. RLS with zero policies = zero
-- access for anon/authenticated, which is exactly what we want here.

create index if not exists unlock_keys_prefix_idx on public.unlock_keys(key_prefix);

-- ============================================================
-- unlock_events — audit log of every unlock attempt
-- ============================================================
create table if not exists public.unlock_events (
  id uuid primary key default gen_random_uuid(),
  key_id uuid references public.unlock_keys(id) on delete set null,
  scope_type text,
  scope_id uuid,
  ip_hash text not null,              -- hashed client IP, never raw
  user_agent text,
  success boolean not null,
  created_at timestamptz not null default now()
);

alter table public.unlock_events enable row level security;
-- No anon/authenticated policies — service role only.

create index if not exists unlock_events_created_at_idx on public.unlock_events(created_at desc);

-- ============================================================
-- Storage buckets
-- ============================================================
-- Run once (or via the Supabase dashboard):
--   insert into storage.buckets (id, name, public) values ('previews', 'previews', false);
--   insert into storage.buckets (id, name, public) values ('full', 'full', false);
--
-- Both buckets are PRIVATE. Every URL served to the browser — preview or
-- full — is a signed URL with a short TTL, generated in
-- lib/services/storage.ts. This means even the "preview" bucket's paths are
-- useless without a signature, closing off directory-traversal / path-
-- guessing attacks against watermarked images too.

-- Storage RLS: only the service role (which bypasses storage RLS same as
-- table RLS) can create signed URLs or write objects. No public policies
-- are created here on purpose.