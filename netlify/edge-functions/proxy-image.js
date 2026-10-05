import { delegatedUrl, edgeHeaders, fetchDelegated, fetchTrusted, rasterType } from './lib/remote-fetch.js';

export default async request => {
  const headers = edgeHeaders(request);
  if (!headers) return new Response('Forbidden', { status: 403 });
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers });
  try {
    const target = delegatedUrl(new URL(request.url).searchParams.get('url'));
    let bytes;
    try { bytes = await fetchTrusted(target.href, 8 * 1024 * 1024); }
    catch { bytes = await fetchDelegated(target.href, 8 * 1024 * 1024); }
    const type = rasterType(bytes);
    if (!type) return Response.json({ error: 'Only PNG, JPEG, GIF and WebP images are supported.' }, { status: 415, headers });
    return new Response(bytes, { headers: { ...headers, 'Content-Type': type, 'Content-Disposition': 'inline; filename="image"' } });
  } catch {
    return Response.json({ error: 'This image could not be imported. Download it and upload it directly.' }, { status: 400, headers });
  }
};
