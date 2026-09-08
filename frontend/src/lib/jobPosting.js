import site from '../data/site.js';

// A job board lives or dies on JobPosting structured data — it is what Google
// reads to put a listing into the jobs experience, and without it a job page
// is just prose to a crawler.
//
// The interesting field is `validThrough`. Google's job posting guidance is
// explicit that expired postings must not stay indexed, and it demotes sites
// that leave them up; a board with a stale tail loses ranking for the listings
// that are still real. Arbeitnow does not publish an expiry, so it is derived:
// a listing is treated as live for LISTING_LIFETIME_DAYS after it was posted.
//
// This matters here more than on most boards, because the ingest is an upsert
// over the current feed and never deletes. Listings that roll off Arbeitnow
// stay in the database forever, so without a derived expiry the index would
// fill with roles nobody can apply to.
export const LISTING_LIFETIME_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export const expiresAt = (postedAt) =>
  new Date(new Date(postedAt).getTime() + LISTING_LIFETIME_DAYS * DAY_MS);

/** True once a listing is old enough that it is probably filled or withdrawn. */
export const isStale = (postedAt, now = Date.now()) =>
  !postedAt || expiresAt(postedAt).getTime() < now;

/**
 * schema.org JobPosting for a single listing.
 *
 * `description` is sent as the sanitized HTML the page already renders, which
 * is what Google asks for — it wants the full posting, formatting included,
 * not a truncated excerpt.
 */
export const buildJobPostingJsonLd = (job) => {
  if (!job) return null;

  const remote = Boolean(job.remote);
  const location = job.location && job.location !== 'Unspecified' ? job.location : null;

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || job.excerpt || '',
    datePosted: new Date(job.postedAt).toISOString(),
    validThrough: expiresAt(job.postedAt).toISOString(),
    employmentType: (job.jobTypes || []).length ? job.jobTypes : undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
    },
    // Google requires jobLocation for an on-site role and
    // applicantLocationRequirements + jobLocationType for a remote one.
    ...(remote
      ? {
          jobLocationType: 'TELECOMMUTE',
          ...(location
            ? { applicantLocationRequirements: { '@type': 'Country', name: location } }
            : {}),
        }
      : location
        ? {
            jobLocation: {
              '@type': 'Place',
              address: { '@type': 'PostalAddress', addressLocality: location },
            },
          }
        : {}),
    // The listing originates elsewhere; naming the source is both honest and
    // what an aggregator is supposed to publish.
    ...(job.sourceUrl ? { sameAs: job.sourceUrl } : {}),
    url: `${site.url}/jobs/${job.slug}`,
    identifier: {
      '@type': 'PropertyValue',
      name: job.company,
      value: job.slug,
    },
  };
};
