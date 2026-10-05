-- Additive Contacts Saver migration. Existing account/login endpoints are unchanged.
-- Legacy password login has no Supabase JWT: this feature therefore issues its own
-- bounded, revocable credential after checking the same password on the server.
-- The older users-table policies and account-management RPCs remain a separate risk.

create schema contacts_private;
revoke all on schema contacts_private from public, anon, authenticated;
grant usage on schema contacts_private to anon, authenticated;

create table contacts_private.sessions (
  token_hash text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  credential_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index contacts_sessions_user_idx on contacts_private.sessions (user_id, created_at desc);
create index contacts_sessions_expiry_idx on contacts_private.sessions (expires_at);

create table contacts_private.login_attempts (
  user_id uuid primary key references public.users(id) on delete cascade,
  attempts integer not null default 0,
  window_started timestamptz not null default now()
);
alter table contacts_private.sessions enable row level security;
alter table contacts_private.login_attempts enable row level security;
revoke all on all tables in schema contacts_private from public, anon, authenticated;

-- Exact tokens, matching the frontend's supported role aliases and combinations.
create function contacts_private.has_admin_role(p_role text)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(regexp_split_to_array(
    regexp_replace(translate(lower(p_role), '[]{}"'';', ''),
      '(admin_broadcaster|broadcaster_admin)', 'admin,broadcaster', 'g'),
    '[[:space:]]*[,+&/][[:space:]]*'
  ) && array['admin','super-admin','super_admin','superadmin'], false);
$$;

create function public.create_contacts_session(p_index_number text, p_password text, p_remember_me boolean default false)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user public.users%rowtype;
  v_attempt contacts_private.login_attempts%rowtype;
  v_token text;
  v_expiry timestamptz;
begin
  if p_index_number is null or length(p_index_number) > 100 or
     p_password is null or octet_length(p_password) < 1 or octet_length(p_password) > 72 then
    return jsonb_build_object('success', false);
  end if;
  select * into v_user from public.users where index_number = p_index_number;
  if not found or v_user.is_active is not true or v_user.password_hash is null or
     not contacts_private.has_admin_role(trim(v_user.role)) then
    return jsonb_build_object('success', false);
  end if;
  insert into contacts_private.login_attempts(user_id) values(v_user.id) on conflict do nothing;
  select * into v_attempt from contacts_private.login_attempts where user_id = v_user.id for update;
  if v_attempt.window_started <= now() - interval '15 minutes' then
    update contacts_private.login_attempts set attempts = 0, window_started = now() where user_id = v_user.id;
    v_attempt.attempts := 0;
  end if;
  if v_attempt.attempts >= 10 then
    return jsonb_build_object('success', false);
  end if;
  if v_user.password_hash <> extensions.crypt(p_password, v_user.password_hash) then
    update contacts_private.login_attempts set attempts = attempts + 1 where user_id = v_user.id;
    return jsonb_build_object('success', false);
  end if;
  update contacts_private.login_attempts set attempts = 0, window_started = now() where user_id = v_user.id;
  delete from contacts_private.sessions where expires_at <= now();
  -- At most ten active contacts credentials per account.
  delete from contacts_private.sessions where token_hash in (
    select token_hash from contacts_private.sessions where user_id = v_user.id order by created_at desc offset 9
  );
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_expiry := now() + case when p_remember_me then interval '30 days' else interval '8 hours' end;
  insert into contacts_private.sessions(token_hash, user_id, credential_hash, expires_at)
  values(encode(extensions.digest(v_token, 'sha256'), 'hex'), v_user.id, v_user.password_hash, v_expiry);
  return jsonb_build_object('success', true, 'token', v_token, 'expires_at', v_expiry);
end;
$$;

create function public.revoke_contacts_session(p_token text)
returns void language sql security definer set search_path = '' as $$
  delete from contacts_private.sessions
  where length(p_token) = 64 and token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

-- Only identity proofs are authoritative; x-user-index is just an account-match
-- check so a leftover Google session cannot act as a different app profile.
create function contacts_private.current_admin_id()
returns uuid language plpgsql stable security definer set search_path = '' as $$
declare
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_token text;
  v_id uuid;
  v_auth_id uuid := auth.uid();
begin
  v_token := v_headers->>'x-contacts-token';
  if v_token is not null then
    if v_token !~ '^[a-f0-9]{64}$' then return null; end if;
    select u.id into v_id
    from contacts_private.sessions s join public.users u on u.id = s.user_id
    where s.token_hash = encode(extensions.digest(v_token, 'sha256'), 'hex')
      and s.expires_at > now() and s.credential_hash = u.password_hash
      and u.index_number = v_headers->>'x-user-index'
      and u.is_active is true and contacts_private.has_admin_role(trim(u.role));
    return v_id;
  end if;
  if v_auth_id is null then return null; end if;
  -- Check live auth identity + session, never user_metadata or an email parameter.
  select u.id into v_id
  from public.users u join auth.users a on lower(a.email) = lower(u.email)
  where a.id = v_auth_id and a.email_confirmed_at is not null
    and u.index_number = v_headers->>'x-user-index'
    and u.is_active is true and contacts_private.has_admin_role(trim(u.role))
    and exists (select 1 from auth.identities i where i.user_id = a.id and i.provider = 'google')
    and exists (select 1 from auth.sessions s where s.user_id = a.id and s.id::text = auth.jwt()->>'session_id');
  return v_id;
end;
$$;

create function public.can_manage_contacts()
returns boolean language sql stable security invoker set search_path = '' as $$
  select contacts_private.current_admin_id() is not null;
$$;

create table public.admin_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  contact_person text check (contact_person is null or length(trim(contact_person)) between 1 and 100),
  category text not null check (category in ('sponsorships','badge-printing','banner-printing','equipment-rental','sound-lighting','led-walls','venues','catering','other')),
  phone text check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$'),
  email text check (email is null or (length(email) <= 254 and email ~ '^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)+$')),
  whatsapp_enabled boolean not null default false,
  location text check (location is null or length(trim(location)) between 1 and 200),
  notes text check (notes is null or length(trim(notes)) between 1 and 2000),
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_text text generated always as (
    lower(name || ' ' || coalesce(contact_person, '') || ' ' || translate(category, '-', ' ') || ' ' ||
      coalesce(phone, '') || ' ' || coalesce(email, '') || ' ' || coalesce(location, '') || ' ' || coalesce(notes, ''))
  ) stored,
  constraint contact_method_required check (phone is not null or email is not null),
  constraint whatsapp_requires_phone check (not whatsapp_enabled or phone is not null)
);
comment on table public.admin_contacts is 'Shared third-party directory for active admins and super-admins, including multi-role admins.';
-- Ordered pagination and category browsing; no unnecessary indexes on optional fields.
create index admin_contacts_name_idx on public.admin_contacts (name, id);
create index admin_contacts_category_name_idx on public.admin_contacts (category, name, id);
alter table public.admin_contacts enable row level security;

create function contacts_private.stamp_contact()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare v_actor uuid := contacts_private.current_admin_id();
begin
  if v_actor is null then raise exception 'Contacts access denied' using errcode = '42501'; end if;
  new.name := trim(new.name);
  new.contact_person := nullif(trim(new.contact_person), '');
  new.location := nullif(trim(new.location), '');
  new.notes := nullif(trim(new.notes), '');
  new.email := nullif(trim(new.email), '');
  new.phone := nullif(trim(new.phone), '');
  if tg_op = 'INSERT' then
    new.created_by := v_actor;
    new.created_at := clock_timestamp();
  else
    new.id := old.id;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  new.updated_by := v_actor;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
create trigger stamp_admin_contact before insert or update on public.admin_contacts
for each row execute function contacts_private.stamp_contact();

-- anon also represents the site's existing custom password login. RLS requires
-- the verified token above; a public key, profile, or claimed index alone fails.
create policy contacts_select on public.admin_contacts for select to anon, authenticated
using ((select contacts_private.current_admin_id()) is not null);
create policy contacts_insert on public.admin_contacts for insert to anon, authenticated
with check ((select contacts_private.current_admin_id()) is not null);
create policy contacts_update on public.admin_contacts for update to anon, authenticated
using ((select contacts_private.current_admin_id()) is not null)
with check ((select contacts_private.current_admin_id()) is not null);
create policy contacts_delete on public.admin_contacts for delete to anon, authenticated
using ((select contacts_private.current_admin_id()) is not null);

revoke all on public.admin_contacts from public, anon, authenticated;
grant select, delete on public.admin_contacts to anon, authenticated;
grant insert (name,contact_person,category,phone,email,whatsapp_enabled,location,notes),
      update (name,contact_person,category,phone,email,whatsapp_enabled,location,notes)
on public.admin_contacts to anon, authenticated;
grant all on public.admin_contacts to service_role;

revoke all on all functions in schema contacts_private from public, anon, authenticated;
grant execute on function contacts_private.current_admin_id() to anon, authenticated;
revoke all on function public.create_contacts_session(text,text,boolean),
  public.revoke_contacts_session(text), public.can_manage_contacts() from public;
grant execute on function public.create_contacts_session(text,text,boolean),
  public.revoke_contacts_session(text), public.can_manage_contacts() to anon, authenticated;
