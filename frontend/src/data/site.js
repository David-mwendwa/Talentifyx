// One source of truth for the strings that appear in <head>, in the prerendered
// pages, in the sitemap and on the social card.
export const site = {
  name: 'Talentifyx',
  url: 'https://talentifyx.netlify.app',
  tagline: 'Precision job matching for engineers',
  description:
    'Talentifyx matches engineering roles to the stack you actually work in. Real listings, tagged by technology, scored against your skills — not keyword soup.',
  shortDescription: 'Engineering roles matched to your stack.',
  author: 'David Mwendwa',
  repo: 'https://github.com/David-mwendwa/Talentifyx',
  locale: 'en_US',
};

// The routes the build prerenders to their own directory (see
// scripts/prerender-meta.mjs, which imports this list). It lives here rather
// than only in the build script because the running app needs it too: Netlify
// serves about/index.html and 301s the un-slashed /about, so the canonical for
// a prerendered route has to carry the trailing slash.
//
// A direct hit gets the redirect and `location.pathname` already ends in a
// slash, which hides the problem. Client-side navigation does not redirect, so
// a visitor arriving via an in-app link would otherwise be handed a canonical
// naming a URL that 301s — invisible unless you test in-app navigation rather
// than the direct hit.
export const PRERENDERED_PATHS = ['/', '/about', '/login', '/register', '/404'];

const normalise = (pathname) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

/** Absolute canonical URL for a pathname, trailing slash included where Netlify requires one. */
export const canonicalUrl = (pathname) => {
  const path = normalise(pathname);
  const slashed = PRERENDERED_PATHS.includes(path) && path !== '/' ? `${path}/` : path;
  return `${site.url}${slashed}`;
};

export default site;
