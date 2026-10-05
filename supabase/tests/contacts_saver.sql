-- Run against a migrated development database. Every fixture is rolled back.
begin;
select set_config('request.jwt.claims', '{}', true);
select set_config('request.headers', '{}', true);
select set_config('test.contacts_prefix', 'contacts-test-' || gen_random_uuid()::text, true);
select set_config('test.contacts_password', encode(extensions.gen_random_bytes(24), 'hex'), true);

do $$
declare r text; result jsonb; idx text; uid uuid;
begin
  foreach r in array array['admin','admin,broadcaster','broadcaster,admin','admin_broadcaster','admin + broadcaster','super-admin','super_admin','superadmin'] loop
    if not contacts_private.has_admin_role(r) then raise exception 'Allowed role rejected: %', r; end if;
  end loop;
  foreach r in array array['writer','broadcaster','not-admin','supervisor','administrator',''] loop
    if contacts_private.has_admin_role(r) then raise exception 'Disallowed role accepted: %', r; end if;
  end loop;
  foreach r in array array['admin','admin,broadcaster','super-admin','writer','broadcaster'] loop
    idx := current_setting('test.contacts_prefix') || '-' || r;
    uid := gen_random_uuid();
    insert into public.users(id,index_number,full_name,role,is_active,password_hash)
    values(uid,idx,'Contacts test fixture',r,true,extensions.crypt(current_setting('test.contacts_password'),extensions.gen_salt('bf')));
    result := public.create_contacts_session(idx, current_setting('test.contacts_password'), false);
    if (result->>'success')::boolean <> contacts_private.has_admin_role(r) then raise exception 'Session role gate failed: %',r; end if;
    if r = 'admin' then
      perform set_config('test.contacts_admin_id', uid::text, true);
      perform set_config('test.contacts_index', idx, true);
      perform set_config('test.contacts_token', result->>'token', true);
    end if;
  end loop;
  if (public.create_contacts_session(current_setting('test.contacts_index'), 'wrong-password', false)->>'success')::boolean then
    raise exception 'Wrong password accepted';
  end if;
end;
$$;

set local role anon;
select set_config('request.headers', jsonb_build_object('x-user-index', current_setting('test.contacts_index'))::text, true);
do $$
begin
  if public.can_manage_contacts() then raise exception 'Spoofed index accepted'; end if;
  if exists(select 1 from public.admin_contacts) then raise exception 'Anonymous contacts read allowed'; end if;
  begin
    insert into public.admin_contacts(name,category,email) values('Unauthorized','other','x@example.com');
    raise exception 'Anonymous insert allowed';
  exception when insufficient_privilege then null; end;
end;
$$;

select set_config('request.headers', jsonb_build_object('x-user-index',current_setting('test.contacts_index'),'x-contacts-token',current_setting('test.contacts_token'))::text, true);
do $$
declare v_id uuid; v_stamp timestamptz; affected integer;
begin
  if not public.can_manage_contacts() then raise exception 'Verified admin rejected'; end if;
  insert into public.admin_contacts(name,category,phone,whatsapp_enabled,notes)
  values('  Test printer  ','badge-printing','+94771234567',true,'Test notes') returning id,updated_at into v_id,v_stamp;
  perform set_config('test.contacts_id',v_id::text,true);
  if not exists(select 1 from public.admin_contacts where id=v_id and name='Test printer' and created_by=current_setting('test.contacts_admin_id')::uuid) then
    raise exception 'Contact attribution/normalization failed';
  end if;
  insert into public.admin_contacts(name,category,email) values('Email only','sponsorships','hello@example.com');
  update public.admin_contacts set name='Updated printer' where id=v_id and updated_at=v_stamp;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Admin update failed'; end if;
  update public.admin_contacts set name='Stale overwrite' where id=v_id and updated_at=v_stamp;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Stale update was not detected'; end if;
  begin
    update public.admin_contacts set created_by=gen_random_uuid() where id=v_id;
    raise exception 'Audit attribution editable';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.admin_contacts(name,category) values('No contact method','other');
    raise exception 'Missing contact method accepted';
  exception when check_violation then null; end;
  begin
    insert into public.admin_contacts(name,category,phone) values('Bad phone','other','javascript:alert(1)');
    raise exception 'Unsafe phone accepted';
  exception when check_violation then null; end;
  begin
    insert into public.admin_contacts(name,category,email) values('Bad email','other','x@example.com?bcc=bad@example.com');
    raise exception 'Unsafe email accepted';
  exception when check_violation then null; end;
  begin
    insert into public.admin_contacts(name,category,email) values('Bad category','invalid','x@example.com');
    raise exception 'Unknown category accepted';
  exception when check_violation then null; end;
  begin
    insert into public.admin_contacts(name,category,email,whatsapp_enabled) values('No WhatsApp number','other','x@example.com',true);
    raise exception 'WhatsApp without phone accepted';
  exception when check_violation then null; end;
  begin
    insert into public.admin_contacts(name,category,email) values(repeat('x',121),'other','x@example.com');
    raise exception 'Oversized name accepted';
  exception when check_violation then null; end;
end;
$$;

-- Quick entry permits one detail, with safe map destinations enforced in SQL too.
do $$ declare v_id uuid; bad text; begin
  insert into public.admin_contacts(name,category,location) values('Address only','venues','Colombo 05') returning id into v_id;
  delete from public.admin_contacts where id=v_id;
  insert into public.admin_contacts(name,category,map_url) values('Map only','venues','https://maps.app.goo.gl/abc123') returning id into v_id;
  delete from public.admin_contacts where id=v_id;
  foreach bad in array array['javascript:alert(1)','https://maps.google.com@evil.test/','https://maps.google.com.evil.test/','https://www.google.com/search?q=foo','https://maps.google.com:444/',''] loop
    begin
      insert into public.admin_contacts(name,category,map_url) values('Unsafe map','other',bad);
      raise exception 'Unsafe map accepted: %',bad;
    exception when check_violation then null; end;
  end loop;
end; $$;

-- Additional numbers are validated and searchable under the same permissions.
do $$ declare v_id uuid; bad jsonb; begin
  insert into public.admin_contacts(name,category,phone,additional_phones)
  values('Multi number','printing-branding','+94771234567','[{"phone":"+94779876543","whatsapp_enabled":true}]') returning id into v_id;
  if not exists(select 1 from public.admin_contacts where id=v_id and has_whatsapp and search_text like '%94779876543%') then raise exception 'Additional number filters/search failed'; end if;
  foreach bad in array array['{}'::jsonb, '[null]'::jsonb, '[{"phone":"+94771234567","whatsapp_enabled":true}]'::jsonb, '[{"phone":"javascript:alert(1)","whatsapp_enabled":true}]'::jsonb, '[{"phone":"+94779876543","whatsapp_enabled":"true"}]'::jsonb, '[{"phone":"+94779876543","whatsapp_enabled":true,"role":"admin"}]'::jsonb] loop
    begin
      update public.admin_contacts set additional_phones=bad where id=v_id;
      raise exception 'Invalid additional numbers accepted: %', bad;
    exception when check_violation then null; end;
  end loop;
  delete from public.admin_contacts where id=v_id;
end; $$;

-- All admin roles share the directory; additional roles never remove admin access.
reset role;
do $$
declare r text; result jsonb;
begin
  foreach r in array array['admin,broadcaster','super-admin'] loop
    result := public.create_contacts_session(current_setting('test.contacts_prefix') || '-' || r,current_setting('test.contacts_password'),false);
    perform set_config('test.contacts_peer_index',current_setting('test.contacts_prefix') || '-' || r,true);
    perform set_config('test.contacts_peer_token',result->>'token',true);
    execute 'set local role anon';
    perform set_config('request.headers',jsonb_build_object('x-user-index',current_setting('test.contacts_peer_index'),'x-contacts-token',current_setting('test.contacts_peer_token'))::text,true);
    if not public.can_manage_contacts() or not exists(select 1 from public.admin_contacts where id=current_setting('test.contacts_id')::uuid) then
      raise exception 'Shared admin access failed: %',r;
    end if;
    execute 'reset role';
  end loop;
end;
$$;

-- Revocation checks are live, not JWT role snapshots or browser profile claims.
select set_config('request.headers',jsonb_build_object('x-user-index',current_setting('test.contacts_index'),'x-contacts-token',current_setting('test.contacts_token'))::text,true);
update public.users set role='writer' where id=current_setting('test.contacts_admin_id')::uuid;
set local role anon;
do $$ declare n integer; begin
  if public.can_manage_contacts() then raise exception 'Demoted admin retains access'; end if;
  update public.admin_contacts set name='Unauthorized update' where id=current_setting('test.contacts_id')::uuid;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Unauthorized update allowed'; end if;
  delete from public.admin_contacts where id=current_setting('test.contacts_id')::uuid;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Unauthorized delete allowed'; end if;
end; $$;
reset role;
update public.users set role='admin',is_active=false where id=current_setting('test.contacts_admin_id')::uuid;
set local role anon;
do $$ begin if public.can_manage_contacts() then raise exception 'Suspended admin retains access'; end if; end; $$;
reset role;
update public.users set is_active=true where id=current_setting('test.contacts_admin_id')::uuid;
update contacts_private.sessions set expires_at=now()-interval '1 minute' where user_id=current_setting('test.contacts_admin_id')::uuid;
set local role anon;
do $$ begin if public.can_manage_contacts() then raise exception 'Expired token accepted'; end if; end; $$;
reset role;
update contacts_private.sessions set expires_at=now()+interval '1 hour' where user_id=current_setting('test.contacts_admin_id')::uuid;
update public.users set password_hash=extensions.crypt('changed-password',extensions.gen_salt('bf')) where id=current_setting('test.contacts_admin_id')::uuid;
set local role anon;
do $$ begin if public.can_manage_contacts() then raise exception 'Token survives password reset'; end if; end; $$;
reset role;
update public.users set password_hash=extensions.crypt(current_setting('test.contacts_password'),extensions.gen_salt('bf')) where id=current_setting('test.contacts_admin_id')::uuid;
do $$ declare result jsonb; i integer; begin
  result := public.create_contacts_session(current_setting('test.contacts_index'),current_setting('test.contacts_password'),false);
  perform set_config('request.headers',jsonb_build_object('x-user-index',current_setting('test.contacts_index'),'x-contacts-token',result->>'token')::text,true);
  perform public.revoke_contacts_session(result->>'token');
  if public.can_manage_contacts() then raise exception 'Revoked token accepted'; end if;
  for i in 1..10 loop perform public.create_contacts_session(current_setting('test.contacts_index'),'wrong-password',false); end loop;
  if (public.create_contacts_session(current_setting('test.contacts_index'),current_setting('test.contacts_password'),false)->>'success')::boolean then
    raise exception 'Credential attempt limit not enforced';
  end if;
end; $$;

-- Google auth fixture: only a verified server identity and a live session suffice.
select set_config('test.contacts_auth_id',gen_random_uuid()::text,true);
select set_config('test.contacts_auth_session_id',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data)
values(current_setting('test.contacts_auth_id')::uuid,current_setting('test.contacts_prefix') || '@example.invalid',now(),'{"provider":"google","providers":["google"]}','{}');
insert into auth.identities(id,user_id,provider,provider_id,identity_data)
values(gen_random_uuid(),current_setting('test.contacts_auth_id')::uuid,'google',current_setting('test.contacts_auth_id'),'{}');
insert into auth.sessions(id,user_id,created_at,updated_at)
values(current_setting('test.contacts_auth_session_id')::uuid,current_setting('test.contacts_auth_id')::uuid,now(),now());
update public.users set email=current_setting('test.contacts_prefix') || '@example.invalid' where id=current_setting('test.contacts_admin_id')::uuid;
select set_config('request.headers',jsonb_build_object('x-user-index',current_setting('test.contacts_index'))::text,true);
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.contacts_auth_id'),'role','authenticated','session_id',current_setting('test.contacts_auth_session_id'))::text,true);
set local role authenticated;
do $$ declare n integer; begin
  if not public.can_manage_contacts() then raise exception 'Verified Google admin rejected'; end if;
  delete from public.admin_contacts where id=current_setting('test.contacts_id')::uuid;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Authorized delete failed'; end if;
end; $$;
reset role;
delete from auth.sessions where id=current_setting('test.contacts_auth_session_id')::uuid;
set local role authenticated;
do $$ begin if public.can_manage_contacts() then raise exception 'Revoked Google session accepted'; end if; end; $$;
reset role;
rollback;
select 'Contacts database checks passed; all fixtures rolled back.' as result;
