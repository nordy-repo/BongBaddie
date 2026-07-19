-- Sample data for local development / demo purposes.
-- Replace image paths with real objects uploaded to the "previews" bucket
-- before this will render correctly (signed URLs are generated at read
-- time from these paths — they must exist in storage).

insert into public.collections (slug, name, description, cover_image_path, is_published)
values
  ('golden-hour', 'Golden Hour', 'A sun-drenched studio series shot at magic hour.', 'seed/golden-hour/cover.jpg', true),
  ('midnight-bloom', 'Midnight Bloom', 'Moody, floral, after-dark portraits.', 'seed/midnight-bloom/cover.jpg', true),
  ('coastal-dreams', 'Coastal Dreams', 'Breezy coastline editorial, unreleased cuts.', 'seed/coastal-dreams/cover.jpg', false)
on conflict (slug) do nothing;

-- Photo items reference collections by slug lookup for convenience here;
-- in the app, inserts always use the collection's UUID directly.
insert into public.photo_items (collection_id, title, description, preview_image_path, full_image_path, price_cents, currency, tags, locked)
select id, 'Golden Hour — 01', 'Preview from the golden hour set.', 'seed/golden-hour/preview-01.jpg', 'seed/golden-hour/full-01.jpg', 1200, 'USD', array['portrait','studio'], true
from public.collections where slug = 'golden-hour'
union all
select id, 'Golden Hour — 02', 'Preview from the golden hour set.', 'seed/golden-hour/preview-02.jpg', 'seed/golden-hour/full-02.jpg', 1200, 'USD', array['portrait','studio'], true
from public.collections where slug = 'golden-hour'
union all
select id, 'Midnight Bloom — 01', 'Preview from the midnight bloom set.', 'seed/midnight-bloom/preview-01.jpg', 'seed/midnight-bloom/full-01.jpg', 1500, 'USD', array['moody','floral'], true
from public.collections where slug = 'midnight-bloom';
