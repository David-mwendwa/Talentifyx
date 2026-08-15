import { useNavigate } from 'react-router-dom';
import { FiBookmark, FiCheck, FiGlobe, FiMapPin } from 'react-icons/fi';
import { initials, timeAgo } from '../utils/format';

const JobCard = ({ job, id, matchScore, onSelect, selected, saved, onSave }) => {
  const navigate = useNavigate();
  const stack = job.stack || [];
  const open = () => (onSelect ? onSelect(job) : navigate(`/jobs/${job.slug}`));

  return (
    <article
      id={id}
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
      className={`card group flex min-w-0 cursor-pointer flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
        selected
          ? 'border-primary-500 ring-1 ring-primary-500 dark:border-primary-500'
          : ''
      }`}>
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 text-sm font-bold text-primary-700 dark:from-primary-950 dark:to-secondary-950 dark:text-primary-300">
          {initials(job.company) || '??'}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-base font-semibold text-dark-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-400">
            {job.title}
          </h3>
          <p className="truncate text-sm text-dark-500 dark:text-dark-400">
            {job.company}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {matchScore != null && (
            <span className="rounded-full bg-success-100 px-2.5 py-1 text-xs font-bold text-success-700 dark:bg-success-950 dark:text-success-300">
              {matchScore}% match
            </span>
          )}
          {onSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave(job);
              }}
              aria-label={saved ? 'Saved to your board' : 'Save this role'}
              className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                saved
                  ? 'border-primary-200 bg-primary-50 text-primary-600 dark:border-primary-900 dark:bg-primary-950 dark:text-primary-300'
                  : 'border-dark-200 text-dark-400 hover:border-primary-300 hover:text-primary-600 dark:border-dark-700'
              }`}>
              {saved ? <FiCheck /> : <FiBookmark />}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-dark-500 dark:text-dark-400">
        <span className="inline-flex items-center gap-1.5">
          <FiMapPin /> {job.location}
        </span>
        {job.remote && (
          <span className="inline-flex items-center gap-1.5 font-medium text-secondary-600 dark:text-secondary-400">
            <FiGlobe /> Remote
          </span>
        )}
        <span className="capitalize">{job.seniority} level</span>
        <span className="ml-auto">{timeAgo(job.postedAt)}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {stack.slice(0, 5).map((tech) => (
          <span key={tech} className="chip-primary">
            {tech}
          </span>
        ))}
        {stack.length > 5 && <span className="chip">+{stack.length - 5}</span>}
      </div>
    </article>
  );
};

export default JobCard;
