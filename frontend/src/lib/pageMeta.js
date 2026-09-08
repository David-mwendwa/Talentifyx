import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import site, { canonicalUrl } from '../data/site.js';

// Patches the tags index.html ships with, rather than adding a second set.
// Duplicate og:title tags are worse than none — a crawler picks one, and not
// necessarily the one describing the page.
const setMeta = (selector, value) => {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute('content', value);
};

const setLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const PAGE_JSONLD_ID = 'page-jsonld';

// Structured data for the current page, replaced rather than appended. A stale
// JobPosting left behind by the previous route would describe the wrong job —
// worse than describing none.
const setJsonLd = (data) => {
  const existing = document.getElementById(PAGE_JSONLD_ID);
  if (!data) {
    if (existing) existing.remove();
    return;
  }
  const el = existing ?? document.createElement('script');
  el.id = PAGE_JSONLD_ID;
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(el);
};

/**
 * Sets the per-route title, description, social tags and structured data.
 *
 * `jsonLd` exists for the job pages — see buildJobPostingJsonLd in
 * lib/jobPosting.js. `noindex` covers the signed-in dashboard and, on job
 * pages, a listing old enough that it is probably filled.
 */
const usePageMeta = (title, description, { noindex = false, jsonLd = null } = {}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} | ${site.name}` : `${site.name} — ${site.tagline}`;
    const desc = description || site.description;
    // Query strings produce endless near-duplicate URLs of the same page — and
    // on a job board with filters, an unbounded number of them. The canonical
    // names the page, not the way the visitor arrived at it. The trailing-slash
    // rule lives in canonicalUrl, because it differs between prerendered routes
    // (which Netlify serves as a directory and redirects to) and everything else.
    const url = canonicalUrl(pathname);

    document.title = fullTitle;
    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', desc);
    setLink('canonical', url);
    setJsonLd(jsonLd);

    let robots = document.head.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex, follow');
    } else if (robots) {
      robots.remove();
    }
  }, [title, description, noindex, jsonLd, pathname]);
};

export default usePageMeta;
