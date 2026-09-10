const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('VITE_SUPABASE_ANON_KEY') || Deno.env.get('VITE_SUPABASE_PUBLISHABLE_KEY') || '';

export default async function handler(request, context) {
  const url = new URL(request.url);
  const siteUrl = Deno.env.get('URL') || Deno.env.get('SITE_URL') || url.origin;

  let newsUrls = "";

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/news?select=id,date&status=eq.published&order=date.desc.nullslast`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const articles = await res.json();
      if (Array.isArray(articles)) {
        newsUrls = articles.map(article => {
          let date = article.date;
          try {
            date = new Date(article.date).toISOString().split('T')[0];
          } catch (e) {
            // fallback
          }
          return `
  <url>
    <loc>${siteUrl}/news/${article.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        }).join('');
      }
    }
  } catch (error) {
    console.error("Error fetching news for sitemap:", error);
  }

  const today = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/news</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/live</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/nethinethera</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>${newsUrls}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export const config = {
  path: "/sitemap.xml"
};
