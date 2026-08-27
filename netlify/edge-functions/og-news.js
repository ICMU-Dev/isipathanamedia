/* global Deno */
/**
 * Netlify Edge Function — Dynamic OG Meta Tags for News Article Pages
 *
 * Social media crawlers (WhatsApp, Facebook, Twitter, iMessage, Discord, etc.)
 * don't execute JavaScript, so React Helmet meta tags are invisible to them.
 *
 * This edge function intercepts requests to /news/*,
 * detects if the request is from a bot/crawler, and if so, fetches the
 * article data from Supabase and injects proper OG meta tags into the HTML
 * before returning it. Regular users get the normal SPA experience.
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SITE_URL = 'https://isipathanamedia.online';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

// Bot/crawler user-agent patterns
const BOT_PATTERNS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'Discordbot',
  'TelegramBot',
  'Googlebot',
  'bingbot',
  'Baiduspider',
  'DuckDuckBot',
  'Applebot',
  'iMessageLinkPreview',
  'Pinterestbot',
  'Embedly',
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some(pattern => ua.includes(pattern.toLowerCase()));
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Fetch news article data from Supabase REST API.
 */
async function fetchArticle(articleId) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/news?id=eq.${articleId}&select=id,title,content,image,date,category,author,tags`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return data[0];
  } catch (e) {
    console.error('Edge Function Supabase Error:', e);
    return null;
  }
}

/**
 * Build a minimal HTML page with OG meta tags for crawlers.
 */
function buildOGPage(article) {
  const title = article.title || 'News Article | Isipathana College Media Unit';
  const cleanContent = stripHtml(article.content);
  const description = cleanContent.length > 160 ? cleanContent.slice(0, 160) : cleanContent || 'Read the latest news from Isipathana College Media Unit.';
  const image = article.image || DEFAULT_IMAGE;
  const canonicalUrl = `${SITE_URL}/news/${article.id}`;
  const author = article.author || 'Isipathana College Media Unit';

  let tagsHtml = '';
  if (article.tags) {
    let tagsList = [];
    if (Array.isArray(article.tags)) {
      tagsList = article.tags;
    } else if (typeof article.tags === 'string') {
      try {
        tagsList = JSON.parse(article.tags);
      } catch {
        tagsList = article.tags.split(',').map(t => t.trim());
      }
    }
    if (Array.isArray(tagsList)) {
      tagsHtml = tagsList
        .filter(Boolean)
        .map(tag => `  <meta property="article:tag" content="${escapeHtml(tag)}">`)
        .join('\n');
    }
  }

  let publishedTimeMeta = '';
  if (article.date) {
    let dateIso = article.date;
    try {
      dateIso = new Date(article.date).toISOString();
    } catch {
      dateIso = article.date;
    }
    publishedTimeMeta = `  <meta property="article:published_time" content="${escapeHtml(dateIso)}">`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta -->
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Isipathana College Media Unit">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="article:author" content="${escapeHtml(author)}">
${publishedTimeMeta ? publishedTimeMeta + '\n' : ''}${tagsHtml ? tagsHtml + '\n' : ''}
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">

  <!-- Canonical -->
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">

  <!-- Redirect real users to the SPA (in case a human opens the bot URL) -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p><a href="${escapeHtml(canonicalUrl)}">Read full article at Isipathana College Media Unit</a></p>
</body>
</html>`;
}

/**
 * Extract article ID from URL path.
 * Pattern: /news/:id
 */
function extractArticleId(pathname) {
  const match = pathname.match(/\/news\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
export default async function handler(request, context) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // 1. Check if request comes from a social media bot/crawler
  if (!isBot(userAgent)) {
    // 2. Normal users: pass through to SPA
    return context.next();
  }

  // 3. For bots: extract article ID from URL path (/news/123 -> 123)
  const articleId = extractArticleId(url.pathname);
  if (!articleId) {
    return context.next();
  }

  // Fetch article data from Supabase
  const article = await fetchArticle(articleId);
  if (!article) {
    return context.next();
  }

  const html = buildOGPage(article);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'Vary': 'User-Agent',
    },
  });
}

export const config = {
  path: '/news/*',
};
