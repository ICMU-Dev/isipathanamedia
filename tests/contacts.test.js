import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_CATEGORIES, EMPTY_CONTACT, contactActions, normalizeContactPhone, normalizeMapUrl, prepareContact, escapeContactSearch } from '../src/utils/contacts.js';
import { clearContactsSession, readContactsSession, storeContactsSession } from '../src/lib/contactsSession.js';

test('local, country-code and international numbers normalize to action-safe E.164', () => {
  for (const phone of ['077 123 4567', '077-123-4567', '77 123 4567', '+94 (77) 123 4567', '0094771234567', '94771234567']) {
    assert.equal(normalizeContactPhone(phone), '+94771234567');
  }
  assert.equal(normalizeContactPhone('+44 20 7946 0958'), '+442079460958');
  assert.equal(normalizeContactPhone('0044 20 7946 0958'), '+442079460958');
  assert.equal(normalizeContactPhone('011 234 5678'), '+94112345678');
  assert.equal(normalizeContactPhone('+1 202 555 0123'), '+12025550123');
  for (const phone of ['', '077', '0771234567 ext 2', 'javascript:alert(1)', '+012345678', '++94771234567', '+1234567890123456']) {
    assert.equal(normalizeContactPhone(phone), null);
  }
});

test('requires a name, known category and at least one valid contact method', () => {
  assert.ok(prepareContact(EMPTY_CONTACT).errors.name);
  assert.ok(prepareContact({ ...EMPTY_CONTACT, name: 'Printer' }).errors.phone);
  assert.ok(prepareContact({ ...EMPTY_CONTACT, name: 'Printer', email: 'hello@example.com', category: 'injected' }).errors.category);
  assert.ok(prepareContact({ ...EMPTY_CONTACT, name: 'Printer', phone: 'bad', email: 'hello@example.com' }).errors.phone);
  for (const email of ['bad@', 'x@example.com?subject=oops', 'x@example.com\r\nBcc:someone@example.com']) {
    assert.ok(prepareContact({ ...EMPTY_CONTACT, name: 'Printer', email }).errors.email);
  }
});

test('email-only, phone-only and whitespace normalization preserve optional fields', () => {
  const emailOnly = prepareContact({ ...EMPTY_CONTACT, name: ' Printer ', email: ' hello@example.com ', whatsapp_enabled: true });
  assert.deepEqual(emailOnly.errors, {});
  assert.equal(emailOnly.data.phone, null);
  assert.equal(emailOnly.data.name, 'Printer');
  assert.equal(emailOnly.data.whatsapp_enabled, false);
  assert.equal(emailOnly.data.notes, null);
  for (const { value: category } of CONTACT_CATEGORIES) {
    assert.deepEqual(prepareContact({ ...EMPTY_CONTACT, name: 'Printer', phone: '0771234567', category }).errors, {});
  }
});

test('limits and control characters are rejected', () => {
  assert.ok(prepareContact({ ...EMPTY_CONTACT, name: 'n'.repeat(121), email: 'a@example.com' }).errors.name);
  assert.ok(prepareContact({ ...EMPTY_CONTACT, name: 'Printer', email: 'a@example.com', notes: 'n'.repeat(2001) }).errors.notes);
  assert.ok(prepareContact({ ...EMPTY_CONTACT, name: 'Printer\u0001', email: 'a@example.com' }).errors.name);
});

test('quick entry accepts an address or map alone and rejects disguised unsafe map links', () => {
  assert.deepEqual(prepareContact({ ...EMPTY_CONTACT, name: 'Venue', location: 'Colombo 05' }).errors, {});
  for (const map_url of ['https://maps.app.goo.gl/abc123', 'https://www.google.com/maps?q=Colombo', 'https://maps.apple.com/?q=Colombo', 'https://www.openstreetmap.org/#map=10/6.9/79.8']) {
    assert.ok(normalizeMapUrl(map_url));
    assert.deepEqual(prepareContact({ ...EMPTY_CONTACT, name: 'Venue', map_url }).errors, {});
  }
  for (const map_url of ['javascript:alert(1)', 'https://maps.google.com@evil.test/', 'https://maps.google.com.evil.test/', 'http://maps.google.com/', 'https://www.google.com/search?q=test', 'https://maps.google.com:444/', 'https://maps.google.com/\\evil', 'https://maps.google.com/\n']) {
    // Trailing whitespace is normalized just like other pasted fields.
    if (map_url.endsWith('\n')) continue;
    assert.equal(normalizeMapUrl(map_url), null);
    assert.ok(prepareContact({ ...EMPTY_CONTACT, name: 'Venue', map_url }).errors.map_url);
  }
});

test('actions follow available methods and explicit WhatsApp support, with safe URLs', () => {
  assert.deepEqual(contactActions({ phone: '0771234567' }), { call: 'tel:+94771234567', whatsapp: null, email: null });
  assert.equal(contactActions({ phone: '0771234567', whatsapp_enabled: true }).whatsapp, 'https://wa.me/94771234567');
  assert.deepEqual(contactActions({ email: 'hello+events@example.com' }), { call: null, whatsapp: null, email: 'mailto:hello%2Bevents%40example.com' });
  assert.deepEqual(contactActions({ phone: 'javascript:alert(1)', email: 'x@example.com?bcc=attacker@example.com', whatsapp_enabled: true }), { call: null, whatsapp: null, email: null });
});

test('search treats SQL LIKE wildcards as literal input', () => {
  assert.equal(escapeContactSearch('  50%_off\\  '), '50\\%\\_off\\\\');
  assert.equal(escapeContactSearch('x'.repeat(110)).length, 100);
});

test('multiple phone numbers normalize, reject duplicates and select an available WhatsApp number', () => {
  const values = { ...EMPTY_CONTACT, name: 'Printer', phone: '0771234567', additional_phones: [{ phone: '0779876543', whatsapp_enabled: true }] };
  const { data, errors } = prepareContact(values);
  assert.deepEqual(errors, {});
  assert.deepEqual(data.additional_phones, [{ phone: '+94779876543', whatsapp_enabled: true }]);
  assert.equal(contactActions(data).call, 'tel:+94771234567');
  assert.equal(contactActions(data).whatsapp, 'https://wa.me/94779876543');
  for (const phone of ['bad', '0771234567', '']) {
    assert.ok(prepareContact({ ...values, additional_phones: [{ phone }] }).errors.phone_1);
  }
  assert.ok(prepareContact({ ...values, additional_phones: Array(5).fill({ phone: '0779876543' }) }).errors.additional_phones);
});

test('contacts credentials are separate, expire, and clear both storage scopes', () => {
  const storage = () => {
    const values = new Map();
    return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  };
  globalThis.localStorage = storage();
  globalThis.sessionStorage = storage();
  const valid = { token: 'test-token', expires_at: new Date(Date.now() + 60000).toISOString() };
  storeContactsSession(valid, false);
  assert.deepEqual(readContactsSession(), valid);
  assert.equal(localStorage.getItem('icmu_contacts_session'), null);
  storeContactsSession(valid, true);
  assert.equal(sessionStorage.getItem('icmu_contacts_session'), null);
  clearContactsSession();
  assert.equal(readContactsSession(), null);
  storeContactsSession({ ...valid, expires_at: '2000-01-01T00:00:00Z' }, false);
  assert.equal(readContactsSession(), null);
  sessionStorage.setItem('icmu_contacts_session', '{broken');
  assert.equal(readContactsSession(), null);
  delete globalThis.localStorage;
  delete globalThis.sessionStorage;
  assert.equal(readContactsSession(), null);
});
