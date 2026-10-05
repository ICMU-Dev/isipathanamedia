export const CONTACT_CATEGORIES = [
  { value: 'printing-branding', label: 'Printing & branding', group: 'Creative & production', keywords: ['badges', 'banners', 'posters', 'stickers', 'books', 'brochures', 'flyers', 'signage', 't-shirts', 'apparel', 'screen printing', 'offset', 'digital', 'sublimation', 'lanyards'] },
  { value: 'design-creative', label: 'Design & creative', group: 'Creative & production', keywords: ['graphic', 'artwork', 'illustration', 'branding', 'animation'] },
  { value: 'photo-video', label: 'Photography & video', group: 'Creative & production', keywords: ['photographer', 'videographer', 'drone', 'editing', 'livestream'] },
  { value: 'event-production', label: 'Event production', group: 'Creative & production', keywords: ['stage', 'event planner', 'production', 'organizer'] },
  { value: 'decor-floristry', label: 'Decor & floristry', group: 'Creative & production', keywords: ['decoration', 'flowers', 'balloons', 'backdrops'] },
  { value: 'merchandise-gifts', label: 'Merchandise & gifts', group: 'Creative & production', keywords: ['awards', 'trophies', 'souvenirs', 'gifts', 'medals'] },
  { value: 'equipment-rental', label: 'Equipment rental', group: 'Equipment & spaces', keywords: ['rent', 'chairs', 'tables', 'tents', 'generators', 'projectors'] },
  { value: 'sound-lighting', label: 'Sound & lighting', group: 'Equipment & spaces', keywords: ['audio', 'speakers', 'microphones', 'dj', 'lights'] },
  { value: 'led-walls', label: 'LED walls & displays', group: 'Equipment & spaces', keywords: ['screens', 'led', 'display', 'video wall'] },
  { value: 'venues', label: 'Venues & spaces', group: 'Equipment & spaces', keywords: ['hall', 'auditorium', 'grounds', 'meeting', 'venue'] },
  { value: 'sponsorships', label: 'Sponsors & partners', group: 'Partners & support', keywords: ['sponsorships', 'funding', 'donations', 'partnerships'] },
  { value: 'catering', label: 'Food & catering', group: 'Partners & support', keywords: ['food', 'drinks', 'refreshments', 'snacks', 'catering'] },
  { value: 'transport-logistics', label: 'Transport & logistics', group: 'Partners & support', keywords: ['bus', 'van', 'delivery', 'courier', 'truck', 'travel'] },
  { value: 'accommodation', label: 'Accommodation', group: 'Partners & support', keywords: ['hotel', 'rooms', 'lodging', 'stay'] },
  { value: 'crew-staffing', label: 'Crew & staffing', group: 'Partners & support', keywords: ['security', 'ushers', 'volunteers', 'hosts', 'presenters', 'performers', 'staff'] },
  { value: 'other', label: 'Other services', group: 'Partners & support', keywords: ['other', 'miscellaneous'] },
];

// Existing badge/banner records stay intact and appear in the broader print list.
export const contactCategory = value => ['badge-printing', 'banner-printing'].includes(value) ? 'printing-branding' : value;
export const contactCategoryValues = value => value === 'printing-branding' ? ['printing-branding', 'badge-printing', 'banner-printing'] : [value];

export const EMPTY_CONTACT = {
  name: '', contact_person: '', category: 'other', phone: '', email: '',
  location: '', map_url: '', notes: '', whatsapp_enabled: false, additional_phones: [],
};

export const MAX_CONTACT_PHONES = 5;
export function contactPhones(contact) {
  return [{ phone: contact.phone, whatsapp_enabled: contact.whatsapp_enabled }, ...(Array.isArray(contact.additional_phones) ? contact.additional_phones : [])]
    .filter(item => item && normalizeContactPhone(item.phone))
    .map(item => ({ phone: normalizeContactPhone(item.phone), whatsapp_enabled: item.whatsapp_enabled === true }));
}

export const CONTACT_LIMITS = {
  name: 120, contact_person: 100, email: 254, location: 200, map_url: 2048, notes: 2000,
};

const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

export function normalizeMapUrl(value) {
  const raw = String(value || '').trim();
  if (!raw || raw.length > 2048 || /[\s\\]/.test(raw)) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    const hosts = ['maps.google.com', 'maps.app.goo.gl', 'maps.apple.com', 'www.openstreetmap.org', 'openstreetmap.org'];
    const pathHost = ['www.google.com', 'google.com', 'www.bing.com', 'bing.com'].includes(url.hostname) && /^\/maps(?:\/|\?|$)/.test(url.pathname);
    if (!hosts.includes(url.hostname) && !pathHost && !(url.hostname === 'goo.gl' && url.pathname.startsWith('/maps/'))) return null;
    return url.href;
  } catch { return null; }
}

// Local Sri Lankan numbers are convenient to enter; store E.164 for action links.
export function normalizeContactPhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (!/^[+\d\s().-]+$/.test(raw)) return null;
  let number = raw.replace(/[\s().-]/g, '');
  if (number.startsWith('00')) number = `+${number.slice(2)}`;
  if (/^0[1-9]\d{8}$/.test(number)) number = `+94${number.slice(1)}`;
  if (/^[1-9]\d{8}$/.test(number)) number = `+94${number}`;
  if (/^94[1-9]\d{8}$/.test(number)) number = `+${number}`;
  return /^\+[1-9]\d{7,14}$/.test(number) ? number : null;
}

export function prepareContact(values) {
  const data = Object.fromEntries(Object.keys(CONTACT_LIMITS).map(key => [key, String(values[key] || '').trim()]));
  data.category = values.category;
  data.phone = normalizeContactPhone(values.phone);
  data.whatsapp_enabled = Boolean(values.whatsapp_enabled && data.phone);
  data.additional_phones = [];
  const errors = {};
  const extra = values.additional_phones ?? [];
  if (!Array.isArray(extra) || extra.length >= MAX_CONTACT_PHONES) errors.additional_phones = 'Add up to five phone numbers.';
  else {
    const seen = new Set(data.phone ? [data.phone] : []);
    extra.forEach((item, index) => {
      const phone = normalizeContactPhone(item?.phone);
      if (!phone) errors[`phone_${index + 1}`] = 'Enter a valid number with a country code.';
      else if (seen.has(phone)) errors[`phone_${index + 1}`] = 'This number is already added.';
      else seen.add(phone);
      data.additional_phones.push({ phone, whatsapp_enabled: Boolean(phone && item?.whatsapp_enabled) });
    });
    if (extra.length && !data.phone) errors.phone = 'Enter the first number or remove it.';
  }
  for (const [key, limit] of Object.entries(CONTACT_LIMITS)) {
    if (data[key].length > limit) errors[key] = `Use ${limit} characters or fewer.`;
    if ([...data[key]].some(char => {
      const code = char.charCodeAt(0);
      return (code < 32 && ![9, 10, 13].includes(code)) || code === 127;
    })) errors[key] = 'Remove unsupported characters.';
  }
  if (!data.name) errors.name = 'Enter a company or contact name.';
  if (!CONTACT_CATEGORIES.some(c => c.value === data.category)) errors.category = 'Choose a category.';
  if (String(values.phone || '').trim() && !data.phone) errors.phone = 'Use a Sri Lankan number (077 123 4567) or include a country code (+44 …).';
  if (data.email && !EMAIL_PATTERN.test(data.email)) errors.email = 'Enter a valid email address.';
  if (data.map_url && !normalizeMapUrl(data.map_url)) errors.map_url = 'Use a secure Google Maps, Apple Maps, Bing Maps, or OpenStreetMap link.';
  if (data.map_url && !errors.map_url) data.map_url = normalizeMapUrl(data.map_url);
  if (!data.phone && !data.email && !data.location && !data.map_url && !errors.phone) errors.phone = 'Add at least one phone, email, map link, or address.';
  for (const key of Object.keys(CONTACT_LIMITS)) data[key] = data[key] || null;
  return { data, errors };
}

export function contactActions(contact) {
  const phones = contactPhones(contact);
  const phone = phones[0]?.phone;
  const whatsapp = phones.find(item => item.whatsapp_enabled)?.phone;
  const email = typeof contact.email === 'string' && EMAIL_PATTERN.test(contact.email) ? contact.email : null;
  return {
    call: phone ? `tel:${phone}` : null,
    whatsapp: whatsapp ? `https://wa.me/${whatsapp.slice(1)}` : null,
    email: email ? `mailto:${encodeURIComponent(email)}` : null,
  };
}

export function escapeContactSearch(value) {
  return String(value).trim().slice(0, 100).replace(/[\\%_]/g, '\\$&');
}

export function contactErrorMessage(error) {
  if (error?.code === '42501' || error?.code === 'PGRST301') return 'Your access has expired or changed. Sign in again to use ICMU Contacts.';
  if (error?.code === 'PGRST205' || error?.code === 'PGRST202') return 'ICMU Contacts is not available yet. Please contact a Super Admin.';
  if (error?.code === '23514' || error?.code === '22001') return 'Check the contact details and try again.';
  if (error?.code === 'CONTACT_CONFLICT') return 'This contact was changed or removed by another admin. Refresh the list before trying again.';
  return 'Could not complete this request. Check your connection and try again.';
}
