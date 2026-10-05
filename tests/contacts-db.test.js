import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

test('Contacts migration, permissions, CRUD, sessions and Google access in PostgreSQL', async () => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    // Minimal existing-app/Supabase contracts; actual contacts DDL is unmodified.
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema extensions;
      create extension pgcrypto with schema extensions;
      create schema auth;
      create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_app_meta_data jsonb,raw_user_meta_data jsonb);
      create table auth.identities(id uuid primary key,user_id uuid,provider text,provider_id text,identity_data jsonb);
      create table auth.sessions(id uuid primary key,user_id uuid,created_at timestamptz,updated_at timestamptz);
      create function auth.uid() returns uuid language sql stable as $$ select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid $$;
      create function auth.jwt() returns jsonb language sql stable as $$ select nullif(current_setting('request.jwt.claims',true),'')::jsonb $$;
      grant usage on schema auth to anon,authenticated;
      create table public.users(id uuid primary key,index_number text unique,full_name text,role text,is_active boolean,password_hash text,email text unique);
    `);
    const migrations = new URL('../supabase/migrations/', import.meta.url);
    for (const filename of (await readdir(migrations)).filter(name => /_(admin_contacts_saver|contacts_session_boundary|contacts_quick_entry|contacts_service_categories|contacts_multiple_phones)\.sql$/.test(name)).sort()) {
      await db.exec(await readFile(new URL(filename, migrations), 'utf8'));
    }
    const result = await db.exec(await readFile(new URL('../supabase/tests/contacts_saver.sql', import.meta.url), 'utf8'));
    assert.match(result.at(-1).rows[0].result, /checks passed/);
    assert.equal((await db.query('select count(*)::int as count from public.users')).rows[0].count, 0);
    assert.equal((await db.query('select count(*)::int as count from public.admin_contacts')).rows[0].count, 0);
  } finally { await db.close(); }
});
