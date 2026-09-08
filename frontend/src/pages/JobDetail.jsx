import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import JobDetailPanel from '../components/JobDetailPanel';
import Loading from '../components/Loading';
import { useSavedJobs } from '../utils/useSavedJobs';
import { lastJobsPath } from '../utils/lastJobsQuery';
import usePageMeta from '../lib/pageMeta';
import { buildJobPostingJsonLd, isStale, LISTING_LIFETIME_DAYS } from '../lib/jobPosting';

const JobDetail = () => {
  const { slug } = useParams();
  const { savedIds, save } = useSavedJobs();
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    api.get(`/jobs/${slug}`).then(({ data }) => setData(data));
  }, [slug]);

  const job = data?.job;
  // Old enough that it is probably filled or withdrawn. The ingest is an
  // upsert over the current Arbeitnow feed and never deletes, so listings that
  // rolled off the feed stay here indefinitely — and a job board that leaves
  // dead postings in the index is demoted for it, which costs the listings
  // that are still real. Asking not to be indexed is cheaper than pretending
  // the role is open.
  const stale = isStale(job?.postedAt);

  usePageMeta(
    job ? `${job.title} at ${job.company}` : undefined,
    job?.excerpt || undefined,
    {
      noindex: Boolean(job) && stale,
      // Structured data is what puts a listing into Google's jobs experience;
      // without it a job page is just prose to a crawler. There is no point
      // publishing it for a role nobody can apply to, so a stale listing gets
      // none. See lib/jobPosting.js.
      jsonLd: job && !stale ? buildJobPostingJsonLd(job) : null,
    }
  );

  if (!data) return <Loading label="Loading role" />;

  const { related } = data;

  return (
    <div className="container py-10">
      <Link
        to={lastJobsPath()}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-dark-500 hover:text-primary-600 dark:text-dark-400">
        <FiArrowLeft /> Back to all roles
      </Link>

      {stale && (
        <p
          role="status"
          className="mx-auto mb-5 max-w-4xl rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800 dark:border-warning-800 dark:bg-warning-950 dark:text-warning-200">
          This listing is more than {LISTING_LIFETIME_DAYS} days old and may already be
          filled.{' '}
          {job.sourceUrl && (
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer external"
              className="font-medium underline underline-offset-2">
              Check the original posting
            </a>
          )}
        </p>
      )}

      <article className="card mx-auto max-w-4xl">
        <JobDetailPanel
          job={job}
          saved={savedIds.has(job._id)}
          onSave={save}
          onApply={() => save(job, 'applied')}
        />
      </article>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-6">Similar roles in this stack</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <JobCard key={item._id} job={item} saved={savedIds.has(item._id)} onSave={save} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default JobDetail;
