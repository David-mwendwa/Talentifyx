import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import api, { errorMessage } from '../utils/api';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const describe = (query) => {
  const parts = [];
  if (query.search) parts.push(`"${query.search}"`);
  if (query.stack) parts.push(query.stack.split(',').join(' / '));
  if (query.seniority) parts.push(query.seniority.split(',').join(' / '));
  if (query.workMode) parts.push(query.workMode);
  if (query.location) parts.push(`in ${query.location}`);
  return parts.length ? parts.join(' · ') : 'All roles';
};

const SavedSearches = () => {
  const navigate = useNavigate();
  const [searches, setSearches] = useState(null);

  const load = () =>
    api.get('/saved-searches').then(({ data }) => setSearches(data.searches));

  useEffect(() => {
    load();
  }, []);

  const open = async (search) => {
    try {
      await api.patch(`/saved-searches/${search._id}/seen`);
    } catch {
      // Clearing the badge is best-effort; never block the navigation.
    }
    navigate(`/jobs?${new URLSearchParams(search.query).toString()}`);
  };

  const remove = async (id) => {
    setSearches((current) => current.filter((s) => s._id !== id));
    try {
      await api.delete(`/saved-searches/${id}`);
    } catch (error) {
      toast.error(errorMessage(error));
      load();
    }
  };

  if (!searches) return <Loading label="Loading your searches" />;

  if (searches.length === 0) {
    return (
      <EmptyState
        title="No saved searches yet"
        description="Set up filters on the job feed — stack, seniority, remote, location — then hit Save search. You will see here when new roles match it."
        action={
          <Link to="/jobs" className="btn-primary mt-2">
            Build a search
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {searches.map((search) => (
        <article key={search._id} className="card flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-heading text-base font-semibold text-dark-900 dark:text-white">
                {search.name}
              </h2>
              <p className="mt-0.5 truncate text-sm text-dark-500 dark:text-dark-400">
                {describe(search.query)}
              </p>
            </div>
            {search.newCount > 0 && (
              <span className="shrink-0 rounded-full bg-success-100 px-2.5 py-1 text-xs font-bold text-success-700 dark:bg-success-950 dark:text-success-300">
                {search.newCount} new
              </span>
            )}
          </div>

          <p className="text-sm text-dark-600 dark:text-dark-300">
            {search.count} matching {search.count === 1 ? 'role' : 'roles'} right now
          </p>

          <div className="mt-auto flex gap-2">
            <button onClick={() => open(search)} className="btn-primary flex-1 !py-2">
              <FiSearch /> Open
            </button>
            <button
              onClick={() => remove(search._id)}
              aria-label={`Delete ${search.name}`}
              className="btn-outline !px-3 !text-danger-600 hover:!border-danger-300">
              <FiTrash2 />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default SavedSearches;
