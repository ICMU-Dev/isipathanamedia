-- Quick entry: one usable detail is sufficient, including an address or map.
alter table public.admin_contacts add column map_url text;
alter table public.admin_contacts add constraint contacts_map_url_safe check (
  map_url is null or (length(map_url) <= 2048 and map_url !~ '[[:space:]\\]' and
    map_url ~ '^https://(maps\.google\.com/|maps\.app\.goo\.gl/|maps\.apple\.com/|(www\.)?openstreetmap\.org/|(www\.)?(google|bing)\.com/maps(/|\?|#|$)|goo\.gl/maps/)[^[:space:]]*$')
);
alter table public.admin_contacts drop constraint contact_method_required;
alter table public.admin_contacts add constraint contact_method_required
  check (phone is not null or email is not null or location is not null or map_url is not null);
grant insert (map_url), update (map_url) on public.admin_contacts to anon,authenticated;
create index admin_contacts_created_idx on public.admin_contacts (created_at desc,id);
