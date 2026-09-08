import { PRERENDERED_PATHS } from '../src/data/site.js';

// Shared by the prerender step and the build verifier, so the two cannot
// disagree about what any given page is supposed to say.
export const SITE_URL = 'https://talentifyx.netlify.app';
export const SITE_NAME = 'Talentifyx';
export const SITE_TAGLINE = 'Precision job matching for engineers';
export const SITE_DESCRIPTION =
  'Talentifyx matches engineering roles to the stack you actually work in. Real listings, tagged by technology, scored against your skills — not keyword soup.';

export const NOT_FOUND_PATH = '/404';

// Only the routes that render something without data. /jobs and /insights are
// public and indexable, but both are empty shells until the API answers, so
// prerendering them would ship a page that says nothing — worse than letting
// the crawler render it. They are in the sitemap; they are not prerendered.
export const ROUTES = [
  {
    path: '/',
    title: null,
    description: SITE_DESCRIPTION,
    changefreq: 'daily',
    priority: '1.0',
  },
  {
    path: '/about',
    title: 'About',
    description:
      'How Talentifyx sources listings, tags them by technology, and scores them against the stack you declare.',
    changefreq: 'monthly',
    priority: '0.6',
  },
  {
    path: '/login',
    title: 'Sign in',
    description:
      'Sign in to Talentifyx to track applications, save searches and see roles matched to your stack.',
    changefreq: 'monthly',
    priority: '0.4',
  },
  {
    path: '/register',
    title: 'Create an account',
    description:
      'Create a Talentifyx account, declare your stack, and get engineering roles scored against it.',
    changefreq: 'monthly',
    priority: '0.4',
  },
  {
    path: NOT_FOUND_PATH,
    title: 'Page not found',
    description: 'That page does not exist on Talentifyx.',
    noindex: true,
  },
];

export const PRERENDER_PATHS = ROUTES.map((r) => r.path);

// Two lists of the same thing is one list too many, but ROUTES also carries
// titles and descriptions the app has no use for. Keeping them separate and
// asserting they agree costs nothing and catches the drift.
if (
  PRERENDERED_PATHS.length !== PRERENDER_PATHS.length ||
  PRERENDER_PATHS.some((p) => !PRERENDERED_PATHS.includes(p))
) {
  throw new Error(
    `prerender-meta: ROUTES (${PRERENDER_PATHS.join(', ')}) disagrees with ` +
      `PRERENDERED_PATHS in src/data/site.js (${PRERENDERED_PATHS.join(', ')})`
  );
}

// Public routes that are indexable but not prerendered, so they still belong
// in the sitemap.
export const EXTRA_SITEMAP = [
  { path: '/jobs', changefreq: 'daily', priority: '0.9' },
  { path: '/insights', changefreq: 'weekly', priority: '0.5' },
];

export const metaForPath = (path) => ROUTES.find((r) => r.path === path);

export const titleFor = (route) =>
  route.title ? `${route.title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;

// Delegated to the app's own canonicalUrl so the HTML the build writes and the
// HTML the running app rewrites cannot disagree about the same page.
export { canonicalUrl as canonicalFor } from '../src/data/site.js';

// The signed-in dashboard. Job pages are deliberately NOT here: they are the
// reason this site should be indexed at all, and a stale one asks for noindex
// itself (see lib/jobPosting.js) rather than being blocked from crawling —
// a page a crawler cannot fetch is a page whose noindex it never reads.
export const DISALLOW = ['/dashboard', '/404'];
