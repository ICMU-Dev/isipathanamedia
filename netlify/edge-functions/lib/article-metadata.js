// Read metadata as strings, never execute fetched markup or emit it as HTML.
export function articleMetadata(html) {
  const decode = value => value.replace(/&(amp|quot|apos|lt|gt|nbsp|#x[\da-f]+|#\d+);/gi, (match, entity) => {
    const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
    const number = parseInt(entity.slice(entity[1]?.toLowerCase() === 'x' ? 2 : 1), entity[1]?.toLowerCase() === 'x' ? 16 : 10);
    return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : match;
  });
  const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match => [match[1].toLowerCase(), decode(match[2] ?? match[3])]));
  const values = {};
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (attrs.content) values[(attrs.property || attrs.name || '').toLowerCase()] ||= attrs.content;
  }
  let description = '';
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (attributes(match[1]).type?.toLowerCase() !== 'application/ld+json') continue;
    try {
      const data = JSON.parse(match[2]);
      const candidates = Array.isArray(data) ? data : [data, ...(Array.isArray(data?.['@graph']) ? data['@graph'] : [])];
      for (const item of candidates) {
        const value = item?.articleBody || item?.description || item?.text;
        if (typeof value === 'string') description = value;
      }
    } catch { /* Ignore malformed structured metadata. */ }
  }
  return {
    title: values['og:title'] || decode(html.match(/<title\b[^>]*>([^<]*)<\/title\s*>/i)?.[1] || '').replace(/\s*\|\s*facebook$/i, '').trim(),
    description: description || values['og:description'] || values.description || '',
    image: values['og:image'] || '',
  };
}
