import { Link } from 'react-router-dom';
import {
  FiBookmark,
  FiCheck,
  FiCheckCircle,
  FiExternalLink,
  FiGlobe,
  FiMapPin,
} from 'react-icons/fi';
import { initials, timeAgo } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const JobDetailPanel = ({ job, saved, onSave, onApply, dense = false }) => {
  const { user } = useAuth();
  const stack = job.stack || [];
  const matchedStack = user
    ? stack.filter((tech) => user.stack?.includes(tech))
    : [];

  return (
    <div className={dense ? 'p-5' : 'p-6 sm:p-8'}>
      <div className="flex flex-wrap items-start gap-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 font-bold text-primary-700 dark:from-primary-950 dark:to-secondary-950 dark:text-primary-300">
          {initials(job.company) || '??'}
        </span>
        <div className="min-w-0 flex-1">
          <h1
            className={`font-heading font-bold text-dark-900 dark:text-white ${
              dense ? 'text-xl' : 'text-2xl sm:text-3xl'
            }`}>
            {job.title}
          </h1>
          <p className="mt-1 text-dark-600 dark:text-dark-300">{job.company}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-dark-500 dark:text-dark-400">
            <span className="inline-flex items-center gap-1.5">
              <FiMapPin /> {job.location}
            </span>
            {job.remote && (
              <span className="inline-flex items-center gap-1.5 text-secondary-600 dark:text-secondary-400">
                <FiGlobe /> Remote friendly
              </span>
            )}
            <span className="capitalize">{job.seniority} level</span>
            <span>Posted {timeAgo(job.postedAt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noreferrer"
          onClick={onApply}
          className="btn-primary">
          Apply on <span className="capitalize">{job.source}</span>{' '}
          <FiExternalLink />
        </a>
        <button onClick={() => onSave?.(job)} className="btn-outline">
          {saved ? <FiCheck /> : <FiBookmark />}
          {saved ? 'On your board' : 'Save to my board'}
        </button>
        {dense && (
          <Link to={`/jobs/${job.slug}`} className="btn-ghost">
            Open full page
          </Link>
        )}
      </div>

      {user && user.stack.length > 0 && (
        <div className="mt-5 rounded-lg bg-primary-50 p-4 dark:bg-primary-950/60">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-700 dark:text-primary-300">
            Stack fit — {matchedStack.length}/{user.stack.length}
          </p>
          <p className="mt-1 text-sm text-primary-800/90 dark:text-primary-200/90">
            {matchedStack.length
              ? `Overlaps on ${matchedStack.join(', ')}`
              : 'No overlap with your declared stack yet'}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {stack.map((tech) => (
          <span
            key={tech}
            className={
              matchedStack.includes(tech)
                ? 'chip border-success-200 bg-success-50 text-success-700 dark:border-success-900 dark:bg-success-950 dark:text-success-300'
                : 'chip-primary'
            }>
            {matchedStack.includes(tech) && <FiCheckCircle />} {tech}
          </span>
        ))}
      </div>

      <div
        className="job-description mt-7 border-t border-dark-200 pt-7 text-sm text-dark-700 dark:border-dark-800 dark:text-dark-300"
        dangerouslySetInnerHTML={{ __html: job.description }}
      />

      {job.tags?.length > 0 && (
        <div className="mt-7 border-t border-dark-200 pt-5 dark:border-dark-800">
          <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-dark-500 dark:text-dark-400">
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPanel;
