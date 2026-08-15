const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'h4',
  'blockquote',
]);

const ENTITIES = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&amp;': '&',
};

// A minority of Arbeitnow listings arrive entity-escaped (`&lt;h2&gt;` rather than
// `<h2>`). Left alone they sail past the tag sanitizer untouched and the browser
// then decodes them into visible markup, so they are decoded here first.
//
// The test is a ratio rather than "has no real tags": these listings still carry
// a couple of genuine tags in the footer Arbeitnow appends, while a normal
// description that merely quotes `&lt;div&gt;` in its prose is mostly real tags.
// Decoding only when escaped tags outnumber real ones separates the two.
export const decodeEscapedHtml = (html = '') => {
  const realTags = (html.match(/<[a-z][^>]*>/gi) || []).length;
  const escapedTags = (html.match(/&lt;\/?[a-z][^&]*&gt;/gi) || []).length;
  if (escapedTags <= realTags) return html;

  // &amp; is decoded last so `&amp;lt;` does not turn into a tag.
  return html
    .replace(/&(lt|gt|quot|#39|apos);/gi, (match) => ENTITIES[match.toLowerCase()])
    .replace(/&amp;/gi, '&');
};

// Job descriptions arrive as third-party HTML and are rendered with
// dangerouslySetInnerHTML, so everything outside the allow-list is dropped here
// rather than trusted in the browser. Attributes are stripped wholesale.
export const sanitizeHtml = (html = '') =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (match, tag) => {
      const name = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(name)) return '';
      return match.startsWith('</') ? `</${name}>` : `<${name}>`;
    })
    .replace(/(\s*<p>\s*<\/p>\s*)+/g, '')
    .trim();
