import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useSavedJobs } from '../utils/useSavedJobs';

const Matches = () => {
  const { user } = useAuth();
  const { savedIds, save } = useSavedJobs();
  const [jobs, setJobs] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/jobs/matches', { params: { limit: 12 } }).then(({ data }) => setJobs(data.jobs));
    api.get('/applications/stats').then(({ data }) => setStats(data));
  }, []);

  if (!jobs || !stats) return <Loading label="Scoring the market" />;

  const tiles = [
    { label: 'Matched roles', value: jobs.length },
    { label: 'Saved', value: stats.stats.saved },
    { label: 'Applied', value: stats.stats.applied },
    { label: 'Interviews', value: stats.stats.interview },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
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

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-dark-900 dark:text-white">
            {user.stack.length ? 'Your top matches' : 'Latest roles'}
          </h2>
          <Link to="/jobs" className="btn-outline shrink-0">
            Browse everything
          </Link>
        </div>

        {!user.stack.length && (
          <div className="mb-5 rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800 dark:border-warning-900 dark:bg-warning-950 dark:text-warning-200">
            You have not declared a stack yet, so these are simply the newest roles.{' '}
            <Link to="/dashboard/profile" className="font-semibold underline">
              Add your stack
            </Link>{' '}
            to get scored matches.
          </div>
        )}

        {jobs.length === 0 && (
          <EmptyState
            title="No roles match your stack right now"
            description="The board refreshes as new listings are ingested. Widen your stack in Profile, or browse everything to see what is open today."
            action={
              <Link to="/jobs" className="btn-primary mt-2">
                Browse all roles
              </Link>
            }
          />
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              matchScore={job.matchScore}
              saved={savedIds.has(job._id)}
              onSave={save}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Matches;
