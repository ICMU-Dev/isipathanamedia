-- Keep privileged implementation functions out of the exposed API schema.
alter function public.create_contacts_session(text,text,boolean) set schema contacts_private;
alter function public.revoke_contacts_session(text) set schema contacts_private;

create function public.create_contacts_session(p_index_number text, p_password text, p_remember_me boolean default false)
returns jsonb language sql security invoker set search_path = '' as $$
  select contacts_private.create_contacts_session(p_index_number,p_password,p_remember_me);
$$;
create function public.revoke_contacts_session(p_token text)
returns void language sql security invoker set search_path = '' as $$
  select contacts_private.revoke_contacts_session(p_token);
$$;
revoke all on function public.create_contacts_session(text,text,boolean), public.revoke_contacts_session(text) from public;
grant execute on function public.create_contacts_session(text,text,boolean), public.revoke_contacts_session(text) to anon,authenticated;

-- These are internal credentials, deliberately inaccessible through RLS.
-- Only the narrowly scoped private functions operate on them as their owner.
create policy contacts_sessions_no_direct_access on contacts_private.sessions
for all to anon,authenticated using (false) with check (false);
create policy contacts_attempts_no_direct_access on contacts_private.login_attempts
for all to anon,authenticated using (false) with check (false);
