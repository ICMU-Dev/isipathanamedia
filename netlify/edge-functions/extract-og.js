import { delegatedUrl, edgeHeaders, fetchDelegated, readLimited } from './lib/remote-fetch.js';
import { articleMetadata } from './lib/article-metadata.js';

export default async request => {
  const headers = edgeHeaders(request);
  if (!headers) return new Response('Forbidden', { status: 403 });
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers });
  try {
    const target = delegatedUrl(new URL(request.url).searchParams.get('url'));
    // Keep arbitrary destination fetching outside this application's network.
    // Never follow service redirects or fall back to fetching the supplied URL.
    const text = value => typeof value === 'string' ? value.slice(0, 10000) : '';
    const generic = value => /^(facebook|log in|log into facebook|sign up|explore the things you love)/i.test(value);
    let data;
    try {
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(target.href)}`, {
        redirect: 'error', signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) { await response.body?.cancel(); throw new Error('Metadata service unavailable'); }
      data = JSON.parse(new TextDecoder().decode(await readLimited(response, 512 * 1024))).data;
    } catch { /* Complete the import using the existing external proxy below. */ }
    let title = text(data?.title), description = text(data?.description), image = '';
    const imageUrl = value => {
      try { return value ? delegatedUrl(new URL(value, target).href).href : ''; } catch { return ''; }
    };
    image = imageUrl(data?.image?.url);
    if (generic(title)) title = '';
    if (generic(description)) description = '';
    if (!title || !description || !image) {
      try {
        const fallback = articleMetadata(new TextDecoder().decode(await fetchDelegated(target.href, 2 * 1024 * 1024)));
        if (!title && !generic(fallback.title)) title = text(fallback.title);
        if (!description && !generic(fallback.description)) description = text(fallback.description);
        if (!image) image = imageUrl(fallback.image);
      } catch { /* Keep any usable primary metadata when the fallback is unavailable. */ }
    }
    if (!title && !description && !image) throw new Error('No metadata available');
    if (!description) description = title;
    if (title && description.startsWith(title.replace(/\.\.\.$/, '').trim())) title = '';
    return Response.json({ title, description, image, original_url: target.href }, { headers });
  } catch {
    return Response.json({ error: 'Could not import this link. You can enter the details manually.' }, { status: 400, headers });
  }
};
