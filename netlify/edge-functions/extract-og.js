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
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (origin && !isAllowed) {
      return Response.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    const urlStr = new URL(request.url).searchParams.get('url');
    if (!urlStr) return Response.json({ error: 'Missing url parameter' }, { status: 400, headers: corsHeaders });

    let targetUrl;
    try {
      targetUrl = new URL(urlStr);
    } catch (e) {
      return Response.json({ error: 'Invalid URL' }, { status: 400, headers: corsHeaders });
    }

    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return Response.json({ error: 'Invalid protocol' }, { status: 400, headers: corsHeaders });
    }

    // Basic SSRF protection: block private/local IPs
    const hostname = targetUrl.hostname;
    const isLocal = hostname === 'localhost' || hostname.endsWith('.local') || 
                    hostname.startsWith('127.') || hostname.startsWith('10.') || 
                    hostname.startsWith('192.168.') || hostname.startsWith('169.254.') ||
                    hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);
    
    if (isLocal) {
      return Response.json({ error: 'Access to internal network is not allowed' }, { status: 403, headers: corsHeaders });
    }

    let title, description, image;

    const isGenericText = (text) => {
      if (!text) return true;
      const t = text.trim();
      return /^(facebook|log in|log into facebook|sign up|explore the things you love|see photos, profile pictures and more on facebook|connect with friends and the world around you on facebook)/i.test(t);
    };

    // 1. First try Microlink API (often gets full text and bypasses basic blocks)
    try {
      const mlResponse = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl.href)}`);
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        if (mlData.data) {
          const mlTitle = mlData.data.title;
          const mlDesc = mlData.data.description;
          if (!isGenericText(mlTitle)) title = mlTitle;
          if (!isGenericText(mlDesc)) description = mlDesc;
          image = mlData.data.image?.url;
        }
      }
    } catch (e) {
      console.error("Microlink extraction failed", e);
    }

    // 2. Fallback to manual scraping if any field is missing or generic
    if (!title || !description || !image) {
      const response = await fetch(targetUrl.href, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      const html = await response.text();

      const decodeEntities = (encodedString) => {
        if (!encodedString) return null;
        const translate_re = /&(nbsp|amp|quot|lt|gt|#x[0-9a-fA-F]+|#[0-9]+);/g;
        const translate = { "nbsp": " ", "amp": "&", "quot": "\"", "lt": "<", "gt": ">" };
        return encodedString.replace(translate_re, function(match, entity) {
          if (translate[entity]) return translate[entity];
          if (entity[0] === '#' && entity[1] === 'x') return String.fromCharCode(parseInt(entity.slice(2), 16));
          if (entity[0] === '#') return String.fromCharCode(parseInt(entity.slice(1), 10));
          return match;
        });
      };

      const extract = (regex) => {
        const match = html.match(regex);
        return match ? decodeEntities(match[1]) : null;
      };

      // Try to find JSON-LD which often contains the full un-truncated articleBody
      let ldJsonDesc = null;
      try {
        const ldMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
        if (ldMatches) {
          for (const match of ldMatches) {
            const inner = match.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '');
            const parsed = JSON.parse(inner);
            if (parsed.articleBody) ldJsonDesc = parsed.articleBody;
            else if (parsed.description) ldJsonDesc = parsed.description;
            else if (parsed.text) ldJsonDesc = parsed.text;
          }
        }
      } catch (e) {}

      const rawTitle = extract(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                       extract(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i) ||
                       extract(/<title[^>]*>([^<]+)<\/title>/i)?.replace(/\s*\|\s*facebook$/i, '')?.trim();
      
      const rawDesc = ldJsonDesc ||
                      extract(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                      extract(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i) ||
                      extract(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

      if (!title && rawTitle && !isGenericText(rawTitle)) {
        title = rawTitle;
      }

      if (!description && rawDesc && !isGenericText(rawDesc)) {
        description = rawDesc;
      }
      
      if (!image) {
        image = extract(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                extract(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      }
    }

    // Clean up title if it's just a truncated version of the description (common on Facebook)
    if (title && description) {
      const cleanTitle = title.replace(/[\n\r]+/g, ' ').trim();
      const cleanDesc = description.replace(/[\n\r]+/g, ' ').trim();
      
      if (cleanDesc.startsWith(cleanTitle.replace(/\.\.\.$/, '').trim()) || 
          title.includes('\n\n')) {
        title = '';
      }
    }

    // If description is empty but title has the post text (very common for FB photos/updates), use title
    if (!description && title && !isGenericText(title)) {
      description = title;
    }

    return Response.json(
      { title, description, image, original_url: urlStr },
      { headers: corsHeaders }
    );
  } catch (error) {
    // Avoid leaking internal error details
    return Response.json({ error: 'An error occurred while fetching the URL' }, { status: 500, headers: corsHeaders });
  }
};
