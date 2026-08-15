import { extractSeniority, extractStack, stripHtml } from '../utils/stack.js';
import { decodeEscapedHtml, sanitizeHtml } from '../utils/sanitize.js';

const API_URL = 'https://www.arbeitnow.com/api/job-board-api';

const fetchPage = async (page) => {
  const res = await fetch(`${API_URL}?page=${page}`);
  if (!res.ok) {
    throw new Error(`Arbeitnow API responded ${res.status}`);
  }
  return res.json();
};

const normalize = (job) => {
  const html = decodeEscapedHtml(job.description);
  const plain = stripHtml(html);
  const stack = extractStack(job.title, job.tags, job.job_types, plain);
  return {
    slug: job.slug,
    source: 'arbeitnow',
    sourceUrl: job.url,
    title: job.title,
    company: job.company_name,
    location: job.location || 'Unspecified',
    remote: Boolean(job.remote),
    description: sanitizeHtml(html),
    excerpt: plain.slice(0, 320),
    tags: job.tags || [],
    jobTypes: job.job_types || [],
    stack,
    seniority: extractSeniority(job.title),
    postedAt: new Date(Number(job.created_at) * 1000),
  };
};

// Only listings we can plausibly describe as tech roles make it into the board.
const isTechRole = (job) => job.stack.length > 0;

export const fetchJobs = async ({ pages = 4 } = {}) => {
  const jobs = [];
  for (let page = 1; page <= pages; page++) {
    const { data, links } = await fetchPage(page);
    jobs.push(...data.map(normalize).filter(isTechRole));
    if (!links?.next) break;
  }
  return jobs;
};
