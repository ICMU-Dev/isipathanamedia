import DOMPurify from 'dompurify';

// DOMPurify returns an inert fragment; never parse article HTML in a live div.
export function articleText(content) {
  if (typeof content !== 'string') return '';
  const fragment = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], ALLOWED_ATTR: [], RETURN_DOM_FRAGMENT: true,
  });
  return fragment.textContent || '';
}

