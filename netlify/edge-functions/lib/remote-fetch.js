// Direct edge requests are restricted to provider-owned public infrastructure.
const PROVIDERS = ['fbcdn.net', 'cdninstagram.com'];
const HOSTS = ['images.unsplash.com', 'i.imgur.com', 'i.ytimg.com', 'platform-lookaside.fbsbx.com', 'dmdvulgsexgkraawqijg.supabase.co', 'www.facebook.com', 'web.facebook.com', 'm.facebook.com', 'facebook.com'];
export function publicUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.href.length > 8192) throw new Error('Unsupported URL');
  return url;
}
export function trustedUrl(value) {
  const url = publicUrl(value);
  if (!HOSTS.includes(url.hostname) && !PROVIDERS.some(host => url.hostname.endsWith(`.${host}`))) throw new Error('Unsupported image host');
  return url;
}
export function delegatedUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port || url.href.length > 8192) throw new Error('Unsupported URL');
  // Public web imports only. Numeric IP forms are canonicalized by URL first.
  if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/i.test(url.hostname) || /\.(local|localhost|internal|test|invalid)$/i.test(url.hostname)) throw new Error('Unsupported host');
  return url;
}
export async function fetchDelegated(value, limit, fetcher = fetch) {
  const target = delegatedUrl(value);
  // The existing public import proxy fetches arbitrary article hosts outside
  // this app's network. Never follow a service redirect back to a caller URL.
  const response = await fetcher(`https://api.allorigins.win/raw?url=${encodeURIComponent(target.href)}`, {
    redirect: 'error', signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) { await response.body?.cancel(); throw new Error('Import service unavailable'); }
  return readLimited(response, limit);
}
export async function readLimited(response, limit) {
  if (Number(response.headers.get('content-length')) > limit) { await response.body?.cancel(); throw new Error('Response too large'); }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Empty response');
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) throw new Error('Response too large');
      chunks.push(value);
    }
  } finally { await reader.cancel(); reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}
export async function fetchTrusted(value, limit, fetcher = fetch) {
  let url = trustedUrl(value);
  const signal = AbortSignal.timeout(10000);
  for (let hop = 0; hop <= 3; hop++) {
    const response = await fetcher(url.href, { redirect: 'manual', signal });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get('location');
      if (!location || hop === 3) throw new Error('Invalid redirect');
      url = trustedUrl(new URL(location, url).href);
      continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw new Error('Fetch failed'); }
    return readLimited(response, limit);
  }
  throw new Error('Too many redirects');
}
export function rasterType(bytes) {
  if (bytes.length < 16) return null;
  const at = (offset, values) => values.every((byte, index) => bytes[offset + index] === byte);
  if (at(0, [137, 80, 78, 71, 13, 10, 26, 10]) && at(12, [73, 72, 68, 82])) return 'image/png';
  if (at(0, [255, 216, 255])) return 'image/jpeg';
  if (at(0, [71, 73, 70, 56]) && [55, 57].includes(bytes[4]) && bytes[5] === 97) return 'image/gif';
  if (at(0, [82, 73, 70, 70]) && at(8, [87, 69, 66, 80])) return 'image/webp';
  return null;
}
export function edgeHeaders(request) {
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox", 'Vary': 'Origin' };
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return null;
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
  return headers;
}
