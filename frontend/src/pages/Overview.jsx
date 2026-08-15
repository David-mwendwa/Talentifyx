import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowRight, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import api from '../utils/api';
import Loading from '../components/Loading';
import { formatDate, isDueToday, isOverdue } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const FUNNEL_STAGES = [
  { key: 'saved', label: 'Saved', color: 'bg-dark-400' },
  { key: 'applied', label: 'Applied', color: 'bg-primary-500' },
  { key: 'interview', label: 'Interview', color: 'bg-warning-500' },
  { key: 'offer', label: 'Offer', color: 'bg-success-500' },
];

const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [gaps, setGaps] = useState(null);

  useEffect(() => {
    api.get('/applications/stats').then(({ data }) => setStats(data));
    api.get('/jobs/skill-gaps').then(({ data }) => setGaps(data));
  }, []);

  if (!stats || !gaps) return <Loading label="Pulling your numbers" />;

  const { funnel, followUps } = stats;
  const widest = Math.max(funnel.saved, 1);
  const dueNow = followUps.filter(
    (item) => isOverdue(item.followUpAt) || isDueToday(item.followUpAt)
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tracked roles', value: stats.total },
          { label: 'Applications out', value: funnel.applied },
          { label: 'Interview rate', value: `${funnel.interviewRate}%` },
          { label: 'Follow-ups due', value: dueNow.length },
        ].map((tile) => (
          <div key={tile.label} className="card p-5">
            <p className="font-heading text-3xl font-bold text-dark-900 dark:text-white">
              {tile.value}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-dark-500 dark:text-dark-400">
              {tile.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <section className="card space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-dark-900 dark:text-white">
              Your funnel
            </h2>
            <Link
              to="/dashboard/board"
              className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
              Open board
            </Link>
          </div>

          {stats.total === 0 ? (
            <p className="py-6 text-center text-sm text-dark-500 dark:text-dark-400">
              Nothing tracked yet.{' '}
              <Link to="/jobs" className="text-primary-600 hover:underline">
                Save your first role
              </Link>{' '}
              and this fills in.
            </p>
          ) : (
            <div className="space-y-4">
              {FUNNEL_STAGES.map((stage) => (
                <div key={stage.key} className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-dark-700 dark:text-dark-200">
                      {stage.label}
                    </span>
                    <span className="text-dark-500 dark:text-dark-400">
                      {funnel[stage.key]}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-dark-100 dark:bg-dark-800">
                    <div
                      className={`h-full rounded-full ${stage.color} transition-all`}
                      style={{
                        width: `${Math.round((funnel[stage.key] / widest) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <p className="pt-1 text-xs text-dark-500 dark:text-dark-400">
                {funnel.applied > 0
                  ? `${funnel.interviewRate}% of your applications reached an interview, ${funnel.offerRate}% an offer.`
                  : 'Move a role to Applied to start measuring your conversion.'}
              </p>
            </div>
          )}
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-dark-900 dark:text-white">
            <FiCalendar className="text-primary-600" /> Follow-ups
          </h2>

          {followUps.length === 0 ? (
            <p className="text-sm text-dark-500 dark:text-dark-400">
              No follow-up dates set. Open any card on your board to add one — it
              is the difference between a lead and a lost thread.
            </p>
          ) : (
            <ul className="space-y-3">
              {followUps.map((item) => {
                const overdue = isOverdue(item.followUpAt);
                const today = isDueToday(item.followUpAt);
                return (
                  <li
                    key={item._id}
                    className="flex items-start gap-3 rounded-lg border border-dark-200 p-3 dark:border-dark-800">
                    {(overdue || today) && (
                      <FiAlertCircle
                        className={`mt-0.5 shrink-0 ${
                          overdue ? 'text-danger-500' : 'text-warning-500'
                        }`}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/jobs/${item.job.slug}`}
                        className="line-clamp-1 text-sm font-semibold text-dark-800 hover:text-primary-600 dark:text-dark-100">
                        {item.job.title}
                      </Link>
                      <p className="truncate text-xs text-dark-500 dark:text-dark-400">
                        {item.job.company}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        overdue
                          ? 'text-danger-600'
                          : today
                            ? 'text-warning-600'
                            : 'text-dark-400'
                      }`}>
                      {overdue ? 'Overdue' : today ? 'Today' : formatDate(item.followUpAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="card space-y-4 p-6">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-dark-900 dark:text-white">
            <FiTrendingUp className="text-primary-600" /> What to learn next
          </h2>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
            {gaps.hasStack
              ? 'Technologies that show up alongside your stack. Adding one opens this many more roles on the board today.'
              : 'Add your stack in Profile and this will show which technology would open the most doors for you.'}
          </p>
        </div>

        {gaps.hasStack && gaps.gaps.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gaps.gaps.map((gap) => (
              <Link
                key={gap.stack}
                to={`/jobs?stack=${encodeURIComponent(gap.stack)}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-dark-200 p-4 transition hover:border-primary-300 hover:shadow-card dark:border-dark-800">
                <span className="font-semibold text-dark-800 dark:text-dark-100">
                  {gap.stack}
                </span>
                <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400">
                  +{gap.unlocks} <FiArrowRight />
                </span>
              </Link>
            ))}
          </div>
        )}

        {!gaps.hasStack && (
          <Link to="/dashboard/profile" className="btn-primary w-fit">
            Add your stack
          </Link>
        )}
      </section>

      {!user.resumeName && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm text-primary-800 dark:border-primary-900 dark:bg-primary-950 dark:text-primary-200">
          Tip: upload your CV and add your profile links in{' '}
          <Link to="/dashboard/profile" className="font-semibold underline">
            Profile
          </Link>{' '}
          so they are one click away every time you apply.
        </div>
      )}
    </div>
  );
};

export default Overview;
