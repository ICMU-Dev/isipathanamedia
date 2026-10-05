import { supabase } from '../supabaseClient';
import { contactCategoryValues, escapeContactSearch, prepareContact } from '../../utils/contacts';

export const CONTACT_PAGE_SIZE = 24;
const FIELDS = 'id,name,contact_person,category,phone,additional_phones,email,whatsapp_enabled,location,map_url,notes,created_at,updated_at';

export async function fetchContacts({ search = '', category = '', channel = '', sort = 'name', page = 0, signal } = {}) {
  const { data: allowed, error: accessError } = await supabase.rpc('can_manage_contacts');
  if (accessError) throw accessError;
  if (!allowed) throw Object.assign(new Error('Access denied'), { code: '42501' });
  let query = supabase.from('admin_contacts').select(FIELDS, { count: 'exact' })
    .order(sort === 'recent' ? 'created_at' : 'name', { ascending: sort !== 'recent' }).order('id')
    .range(page * CONTACT_PAGE_SIZE, (page + 1) * CONTACT_PAGE_SIZE - 1);
  if (category) query = query.in('category', contactCategoryValues(category));
  if (channel === 'whatsapp') query = query.eq('has_whatsapp', true);
  if (channel === 'email') query = query.not('email', 'is', null);
  if (channel === 'phone') query = query.not('phone', 'is', null);
  if (search.trim()) query = query.ilike('search_text', `%${escapeContactSearch(search)}%`);
  if (signal) query = query.abortSignal(signal);
  const { data, count, error } = await query;
  if (error) throw error;
  return { contacts: data || [], count: count || 0 };
}

export async function saveContact(values, existing = null) {
  const { data: payload, errors } = prepareContact(values);
  if (Object.keys(errors).length) throw Object.assign(new Error('Invalid contact'), { code: '23514' });
  const query = existing
    ? supabase.from('admin_contacts').update(payload).eq('id', existing.id).eq('updated_at', existing.updated_at)
    : supabase.from('admin_contacts').insert(payload);
  const { data, error } = await query.select(FIELDS).maybeSingle();
  if (error) throw error;
  if (!data) throw Object.assign(new Error('Contact changed'), { code: 'CONTACT_CONFLICT' });
  return data;
}

export async function deleteContact(contact) {
  const { data, error } = await supabase.from('admin_contacts').delete()
    .eq('id', contact.id).eq('updated_at', contact.updated_at).select('id');
  if (error) throw error;
  if (!data?.length) throw Object.assign(new Error('Contact changed'), { code: 'CONTACT_CONFLICT' });
}
