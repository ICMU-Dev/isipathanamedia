-- Preserve the existing primary number; add up to four more in the same RLS row.
create function contacts_private.valid_additional_phones(p_primary text, p_phones jsonb)
returns boolean language plpgsql immutable security invoker set search_path = '' as $$
declare item jsonb; seen text[] := array[]::text[]; number text;
begin
  if p_phones is null or jsonb_typeof(p_phones) <> 'array' then return false; end if;
  if jsonb_array_length(p_phones) > 4 then return false; end if;
  if jsonb_array_length(p_phones) > 0 and p_primary is null then return false; end if;
  if p_primary is not null then seen := array[p_primary]; end if;
  for item in select value from jsonb_array_elements(p_phones) loop
    if jsonb_typeof(item) <> 'object' then return false; end if;
    if not (item ?& array['phone','whatsapp_enabled']) or (item - 'phone' - 'whatsapp_enabled') <> '{}'::jsonb then return false; end if;
    if jsonb_typeof(item->'phone') <> 'string' or jsonb_typeof(item->'whatsapp_enabled') <> 'boolean' then return false; end if;
    number := item->>'phone';
    if number !~ '^\+[1-9][0-9]{7,14}$' or number = any(seen) then return false; end if;
    seen := array_append(seen, number);
  end loop;
  return true;
end;
$$;
revoke all on function contacts_private.valid_additional_phones(text,jsonb) from public;
grant execute on function contacts_private.valid_additional_phones(text,jsonb) to anon, authenticated, service_role;

alter table public.admin_contacts add column additional_phones jsonb not null default '[]'::jsonb;
alter table public.admin_contacts add constraint contacts_additional_phones_valid
  check (contacts_private.valid_additional_phones(phone, additional_phones));
alter table public.admin_contacts add column has_whatsapp boolean generated always as
  (whatsapp_enabled or additional_phones @> '[{"whatsapp_enabled":true}]'::jsonb) stored;

-- This is derived search text; no user-entered value is removed.
alter table public.admin_contacts drop column search_text;
alter table public.admin_contacts add column search_text text generated always as (
  lower(name || ' ' || coalesce(contact_person, '') || ' ' || translate(category, '-', ' ') || ' ' ||
    coalesce(phone, '') || ' ' || additional_phones::text || ' ' || coalesce(email, '') || ' ' ||
    coalesce(location, '') || ' ' || coalesce(notes, ''))
) stored;
grant insert (additional_phones), update (additional_phones) on public.admin_contacts to anon, authenticated;
