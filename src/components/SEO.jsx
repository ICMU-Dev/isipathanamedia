import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://isipathanamedia.online';
const DEFAULT_TITLE = 'Isipathana College Media Unit';
const DEFAULT_DESCRIPTION = 'Official website of Isipathana College Media Unit (ICMU). Discover Nethinethera – the media day, MPMU Most Popular Media Unit, Sandhwani, and 25+ years of cinematic storytelling at Isipathana College, Colombo.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_KEYWORDS = 'Isipathana College Media Unit, ICMU, Isipathana Media, Nethinethera, MPMU, Sandhwani, school media unit Sri Lanka, media day, Isipathana College Colombo, school media production';

/**
 * Reusable SEO component — drop into any page for full meta coverage.
 *
 * @param {string} title       — Page title (auto-appends site name)
 * @param {string} description — Page description (max ~155 chars for Google)
 * @param {string} path        — Route path e.g. "/nethinethera"
 * @param {string} image       — Absolute URL to OG image
 * @param {string} keywords    — Comma separated keywords
 * @param {string} type        — og:type  (website | article | event)
 * @param {object} jsonLd      — Structured data object (JSON-LD)
 */
const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = DEFAULT_IMAGE,
  keywords = DEFAULT_KEYWORDS,
  type = 'website',
  jsonLd,
  noIndex = false,
}) => {
  const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  const canonicalUrl = `${SITE_URL}${path}`;

  // Ensure image is absolute
  const ogImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* ── Primary Meta ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Isipathana College Media Unit" />
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Robots ── */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* ── Open Graph (Facebook / WhatsApp / LinkedIn) ── */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={DEFAULT_TITLE} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={DEFAULT_TITLE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_LK" />

      {/* ── Twitter Cards ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* ── JSON-LD Structured Data ── */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
