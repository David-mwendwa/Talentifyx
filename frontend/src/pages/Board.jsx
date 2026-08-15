import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCalendar, FiFileText, FiUser } from 'react-icons/fi';
import api, { errorMessage } from '../utils/api';
import {
  APPLICATION_STATUSES,
  formatDate,
  initials,
  isDueToday,
  isOverdue,
  timeAgo,
} from '../utils/format';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ApplicationDrawer from '../components/ApplicationDrawer';

const COLUMN_ACCENTS = {
  saved: 'border-t-dark-400',
  applied: 'border-t-primary-500',
  interview: 'border-t-warning-500',
  offer: 'border-t-success-500',
  rejected: 'border-t-danger-500',
};

const Board = () => {
  const [applications, setApplications] = useState(null);
  const [dragged, setDragged] = useState(null);
  const [active, setActive] = useState(null);

  const load = () =>
    api.get('/applications').then(({ data }) => setApplications(data.applications));

  useEffect(() => {
    load();
  }, []);

  const move = async (application, status) => {
    if (application.status === status) return;
    setApplications((current) =>
      current.map((item) =>
        item._id === application._id ? { ...item, status } : item
      )
    );
    try {
      const { data } = await api.patch(`/applications/${application._id}`, {
        status,
      });
      setApplications((current) =>
        current.map((item) =>
          item._id === data.application._id ? data.application : item
        )
      );
    } catch (error) {
      toast.error(errorMessage(error));
      load();
    }
  };

  const replace = (updated) => {
    setApplications((current) =>
      current.map((item) => (item._id === updated._id ? updated : item))
    );
    setActive(updated);
  };

  const drop = (id) => {
    setApplications((current) => current.filter((item) => item._id !== id));
    setActive(null);
  };

  if (!applications) return <Loading label="Loading your board" />;

  if (applications.length === 0) {
    return (
      <EmptyState
        title="Your board is empty"
        description="Save a role from the job feed and it will show up here, ready to move through applied, interview and offer."
        action={
          <Link to="/jobs" className="btn-primary mt-2">
            Browse roles
          </Link>
        }
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-dark-500 dark:text-dark-400">
        Drag a card between columns to move it, or click one to add notes, a
        contact and a follow-up date.
      </p>

      <div className="grid gap-4 lg:grid-cols-5">
        {APPLICATION_STATUSES.map((status) => {
          const items = applications.filter((item) => item.status === status);
          return (
            <section
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragged && move(dragged, status)}
              className={`rounded-xl border border-t-4 border-dark-200 bg-dark-100/40 p-3 dark:border-dark-800 dark:bg-dark-900/40 ${COLUMN_ACCENTS[status]}`}>
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="font-heading text-sm font-bold capitalize text-dark-700 dark:text-dark-200">
                  {status}
                </h2>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-dark-500 dark:bg-dark-800 dark:text-dark-400">
                  {items.length}
                </span>
              </header>

              <div className="space-y-3">
                {items.map((application) => {
                  const overdue = isOverdue(application.followUpAt);
                  const today = isDueToday(application.followUpAt);
                  return (
                    <article
                      key={application._id}
                      draggable
                      role="button"
                      tabIndex={0}
                      onClick={() => setActive(application)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && setActive(application)
                      }
                      onDragStart={() => setDragged(application)}
                      onDragEnd={() => setDragged(null)}
                      className="card cursor-pointer space-y-2.5 p-3 transition hover:shadow-card-hover">
                      <div className="flex items-start gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary-50 text-[11px] font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                          {initials(application.job.company) || '??'}
                        </span>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold text-dark-900 dark:text-white">
                            {application.job.title}
                          </p>
                          <p className="truncate text-xs text-dark-500 dark:text-dark-400">
                            {application.job.company}
                          </p>
                        </div>
                      </div>

                      {application.followUpAt && (
                        <p
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${
                            overdue
                              ? 'bg-danger-100 text-danger-700 dark:bg-danger-950 dark:text-danger-300'
                              : today
                                ? 'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300'
                                : 'bg-dark-100 text-dark-600 dark:bg-dark-800 dark:text-dark-300'
                          }`}>
                          <FiCalendar />
                          {overdue
                            ? 'Follow up overdue'
                            : today
                              ? 'Follow up today'
                              : formatDate(application.followUpAt)}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-dark-400">
                        {application.notes && (
                          <span className="inline-flex items-center gap-1" title="Has notes">
                            <FiFileText /> Notes
                          </span>
                        )}
                        {application.contactName && (
                          <span className="inline-flex items-center gap-1 truncate" title={application.contactName}>
                            <FiUser /> {application.contactName}
                          </span>
                        )}
                        <span className="ml-auto shrink-0">
                          {timeAgo(application.updatedAt)}
                        </span>
                      </div>

                      <select
                        aria-label="Change stage"
                        value={application.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => move(application, e.target.value)}
                        className="form-input !py-1 text-xs capitalize lg:hidden">
                        {APPLICATION_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <ApplicationDrawer
        application={active}
        onClose={() => setActive(null)}
        onSaved={replace}
        onDeleted={drop}
      />
    </>
  );
};

export default Board;
