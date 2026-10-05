import { test } from 'node:test';
import assert from 'node:assert/strict';
import proxy from '../netlify/edge-functions/proxy-image.js';
import metadata from '../netlify/edge-functions/extract-og.js';
import { delegatedUrl, fetchDelegated, fetchTrusted, rasterType, readLimited, trustedUrl } from '../netlify/edge-functions/lib/remote-fetch.js';

test('untrusted and encoded network destinations never reach fetch', async () => {
  for (const url of ['http://images.unsplash.com/x', 'https://127.0.0.1/', 'https://2130706433/', 'https://0x7f000001/', 'https://[::1]/', 'https://[::ffff:127.0.0.1]/', 'https://169.254.169.254/', 'https://attacker.test/', 'https://fbcdn.net.attacker.test/', 'https://images.unsplash.com@attacker.test/', 'https://images.unsplash.com:444/']) {
    assert.throws(() => trustedUrl(url));
    await assert.rejects(fetchTrusted(url, 100, () => { throw new Error('Network must not be reached'); }));
  }
  assert.equal(trustedUrl('https://scontent.fbcdn.net/image.jpg').hostname, 'scontent.fbcdn.net');
  let calls = 0;
  await assert.rejects(fetchTrusted('https://images.unsplash.com/a', 100, async () => {
    calls++;
    return new Response(null, { status: 302, headers: { location: 'https://127.0.0.1/private' } });
  }));
  assert.equal(calls, 1);
});

test('allowed redirects work and response size is bounded while streaming', async () => {
  let calls = 0;
  const bytes = await fetchTrusted('https://images.unsplash.com/a', 4, async (url, options) => {
    assert.equal(options.redirect, 'manual');
    assert.ok(options.signal);
    calls++;
    return calls === 1 ? new Response(null, { status: 302, headers: { location: '/b' } }) : new Response('good');
  });
  assert.equal(new TextDecoder().decode(bytes), 'good');
  await assert.rejects(readLimited(new Response('12345'), 4));
  await assert.rejects(readLimited(new Response('x', { headers: { 'content-length': '99999' } }), 4));
});

test('proxy rejects executable formats and serves raster bytes with fixed safe headers', async () => {
  const original = globalThis.fetch;
  try {
    const request = () => new Request('https://icmu.test/api/proxy-image?url=https://images.unsplash.com/photo');
    for (const body of ['<!doctype html><script>alert(1)</script>', '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>']) {
      globalThis.fetch = async () => new Response(body, { headers: { 'content-type': 'image/png' } });
      assert.equal((await proxy(request())).status, 415);
      assert.equal(rasterType(new TextEncoder().encode(body)), null);
    }
    const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK3sAAAAASUVORK5CYII=', 'base64'));
    globalThis.fetch = async () => new Response(png, { headers: { 'content-type': 'text/html', 'set-cookie': 'stolen=1' } });
    const response = await proxy(request());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/png');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.match(response.headers.get('content-security-policy'), /sandbox/);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), png);
    assert.equal((await proxy(new Request(request().url, { method: 'POST' }))).status, 405);
  } finally { globalThis.fetch = original; }
});

test('metadata fetches only fixed external services, including errors and unsafe returned links', async () => {
  const original = globalThis.fetch;
  try {
    let calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push(url);
      assert.ok(['https://api.microlink.io', 'https://api.allorigins.win'].includes(new URL(url).origin));
      assert.equal(options.redirect, 'error');
      if (new URL(url).origin === 'https://api.allorigins.win') return new Response('No metadata here');
      return Response.json({ data: { title: 'A title', description: 'Some description', image: { url: 'javascript:alert(1)' } } });
    };
    const req = new Request('https://icmu.test/api/extract-og?url=https://article.example.org/redirect');
    const response = await metadata(req);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).image, '');
    assert.equal(calls.length, 2);
    calls = [];
    globalThis.fetch = async url => { calls.push(url); throw new Error('Service unavailable'); };
    assert.equal((await metadata(req)).status, 400);
    assert.equal(calls.length, 2);
    assert.equal(new URL(calls[0]).origin, 'https://api.microlink.io');
    assert.equal(new URL(calls[1]).origin, 'https://api.allorigins.win');
  } finally { globalThis.fetch = original; }
});

test('ordinary article image hosts import through the fixed proxy without arbitrary direct egress', async () => {
  const original = globalThis.fetch;
  const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK3sAAAAASUVORK5CYII=', 'base64'));
  try {
    let calls = 0;
    globalThis.fetch = async (url, options) => {
      calls++;
      assert.equal(new URL(url).origin, 'https://api.allorigins.win');
      assert.equal(new URL(url).searchParams.get('url'), 'https://news.example.org/cover.png');
      assert.equal(options.redirect, 'error');
      return new Response(png);
    };
    const response = await proxy(new Request('https://icmu.test/api/proxy-image?url=https://news.example.org/cover.png'));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/png');
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), png);
    assert.equal(calls, 1);
    for (const value of ['https://127.1/', 'http://2130706433/', 'https://[::1]/', 'https://service.internal/', 'https://localhost/', 'https://example.org:9000/', 'https://user:pass@example.org/']) {
      assert.throws(() => delegatedUrl(value));
      await assert.rejects(fetchDelegated(value, 100, () => { throw new Error('Must not fetch'); }));
    }
  } finally { globalThis.fetch = original; }
});

test('HTTP links and partial or failed primary metadata preserve OG and structured-data fallback', async () => {
  const original = globalThis.fetch;
  try {
    for (const primaryFails of [false, true]) {
      const calls = [];
      globalThis.fetch = async (url, options) => {
        calls.push(url);
        assert.equal(options.redirect, 'error');
        assert.equal(new URL(url).searchParams.get('url'), 'http://news.example.org/article');
        if (new URL(url).origin === 'https://api.microlink.io') {
          return primaryFails ? new Response('', { status: 503 }) : Response.json({ data: { image: { url: 'https://news.example.org/cover.png' } } });
        }
        assert.equal(new URL(url).origin, 'https://api.allorigins.win');
        return new Response('<meta content="An ordinary &amp; useful title" property="og:title"><meta property="og:image" content="https://news.example.org/cover.png"><script type="application/ld+json">{"articleBody":"The complete article caption."}</script>');
      };
      const response = await metadata(new Request('https://icmu.test/api/extract-og?url=http://news.example.org/article'));
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { title: 'An ordinary & useful title', description: 'The complete article caption.', image: 'https://news.example.org/cover.png', original_url: 'http://news.example.org/article' });
      assert.equal(calls.length, 2);
    }
  } finally { globalThis.fetch = original; }
});
