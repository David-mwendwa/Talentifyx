import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiTarget, FiTrendingUp, FiZap } from 'react-icons/fi';
import api from '../utils/api';
import { timeAgo } from '../utils/format';
import JobCard from '../components/JobCard';
import { useSavedJobs } from '../utils/useSavedJobs';

const HOW_IT_WORKS = [
  {
    icon: FiTarget,
    title: 'Declare your stack',
    body: 'Pick the languages, frameworks and platforms you actually ship with. That list becomes your matching key.',
  },
  {
    icon: FiZap,
    title: 'Get precision matches',
    body: 'Every live role is scored against your stack, so the top of your feed is the part of the market that fits you.',
  },
  {
    icon: FiTrendingUp,
    title: 'Track the pipeline',
    body: 'Save, apply and move roles through interview and offer stages without leaving a spreadsheet behind.',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { savedIds, save } = useSavedJobs();
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState(null);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    // Guard the shape rather than the request: a reachable-but-wrong endpoint
    // resolves successfully with something that is not job data.
    api
      .get('/jobs/filters')
      .then(({ data }) => setMeta(Array.isArray(data?.stacks) ? data : null))
      .catch(() => setMeta(null));
    api
      .get('/jobs', { params: { limit: 6 } })
      .then(({ data }) => setFeatured(Array.isArray(data?.jobs) ? data.jobs : []))
      .catch(() => setFeatured([]));
  }, []);

  const submit = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-dark-200 bg-white dark:border-dark-800 dark:bg-dark-950">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-52 -left-32 h-96 w-96 rounded-full bg-secondary-400/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="container relative grid gap-14 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-28">
          <div className="animate-slide-up space-y-7">
            <span className="chip-primary">
              {meta ? `${meta.totalJobs} live roles` : 'Live roles'}
              {meta?.syncedAt
                ? ` · synced ${timeAgo(meta.syncedAt)}`
                : ' · from the open Arbeitnow API'}
            </span>
            <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-dark-900 sm:text-5xl lg:text-6xl dark:text-white">
              Where top talent meets{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                precision matching
              </span>
            </h1>
            <p className="max-w-xl text-lg text-dark-600 dark:text-dark-300">
              Discover verified engineering and tech opportunities tailored to your
              stack — scored, filtered and tracked in one place.
            </p>

            <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search role, company or technology"
                  aria-label="Search jobs"
                  className="form-input h-12 pl-11"
                />
              </div>
              <button type="submit" className="btn-primary h-12 px-6">
                Find matches <FiArrowRight />
              </button>
            </form>

            {meta && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-dark-500 dark:text-dark-400">Popular:</span>
                {meta.stacks.slice(0, 6).map((stack) => (
                  <Link
                    key={stack.name}
                    to={`/jobs?stack=${encodeURIComponent(stack.name)}`}
                    className="chip !px-3 !py-1.5 hover:border-primary-300 hover:text-primary-700">
                    {stack.name}
                  </Link>
                ))}
              </div>
            )}

            {meta && (
              <div className="flex flex-wrap gap-x-10 gap-y-4 pt-2">
                {[
                  { label: 'Open roles', value: meta.totalJobs },
                  { label: 'Hiring companies', value: meta.totalCompanies },
                  { label: 'Remote-friendly', value: meta.remoteJobs },
                  { label: 'Tracked stacks', value: meta.stacks.length },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-heading text-2xl font-bold text-dark-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-dark-500 dark:text-dark-400">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative hidden lg:block">
            <div className="card animate-float space-y-4 p-6">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-dark-400">
                  Live demand by stack
                </p>
                <Link
                  to="/insights"
                  className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
                  All insights
                </Link>
              </div>
              {(meta?.stacks || []).slice(0, 5).map((stack) => (
                <Link
                  key={stack.name}
                  to={`/jobs?stack=${encodeURIComponent(stack.name)}`}
                  className="block space-y-1.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-dark-800 dark:text-dark-100">
                      {stack.name}
                    </span>
                    <span className="text-xs text-dark-500 dark:text-dark-400">
                      {stack.count} roles
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-dark-100 dark:bg-dark-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-600 to-secondary-500"
                      style={{
                        width: `${Math.round(
                          (stack.count / meta.stacks[0].count) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card space-y-3 p-6">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary-50 text-lg text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                <Icon />
              </span>
              <h3 className="font-heading text-lg font-semibold text-dark-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-dark-600 dark:text-dark-400">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Latest verified roles</h2>
            <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
              Freshly ingested listings, tagged by the stack they actually require.
            </p>
          </div>
          <Link to="/jobs" className="btn-outline shrink-0">
            View all <FiArrowRight />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              saved={savedIds.has(job._id)}
              onSave={save}
            />
          ))}
        </div>
      </section>

      <section className="container pb-24">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 px-8 py-14 text-center text-white">
          <h2 className="font-heading text-3xl font-extrabold">
            Stop scrolling job boards built for everyone
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-50">
            Create a profile, declare your stack, and let Talentifyx rank the market
            for you.
          </p>
          <Link
            to="/register"
            className="btn mt-7 bg-white px-6 text-primary-700 hover:bg-primary-50">
            Create your profile <FiArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
};

export default Landing;
