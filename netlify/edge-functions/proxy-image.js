export default async (request) => {
  const requestUrl = new URL(request.url);
  const configuredOrigin = Deno.env.get('URL') || Deno.env.get('ALLOWED_ORIGIN') || '';
  const origin = request.headers.get('origin');
  const isAllowed = !origin ||
    origin === configuredOrigin ||
    origin === requestUrl.origin ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.endsWith('.netlify.app');

  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : (configuredOrigin || '*'),
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=86400' // Cache proxied images for 24h
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (origin && !isAllowed) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
  }

  try {
    const urlStr = new URL(request.url).searchParams.get('url');
    if (!urlStr) return new Response(JSON.stringify({ error: 'Missing url parameter' }), { status: 400, headers: corsHeaders });

    let targetUrl;
    try {
      targetUrl = new URL(urlStr);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400, headers: corsHeaders });
    }

    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return new Response(JSON.stringify({ error: 'Invalid protocol' }), { status: 400, headers: corsHeaders });
    }

    const hostname = targetUrl.hostname;
    const isLocal = hostname === 'localhost' || hostname.endsWith('.local') || 
                    hostname.startsWith('127.') || hostname.startsWith('10.') || 
                    hostname.startsWith('192.168.') || hostname.startsWith('169.254.') ||
                    hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);
    
    if (isLocal) {
      return new Response(JSON.stringify({ error: 'Access to internal network forbidden' }), { status: 403, headers: corsHeaders });
    }

    const response = await fetch(targetUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'An error occurred while proxying the image' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
};
