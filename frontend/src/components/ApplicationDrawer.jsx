import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiDownload, FiExternalLink, FiTrash2, FiX } from 'react-icons/fi';
import api, { errorMessage } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  APPLICATION_STATUSES,
  STATUS_STYLES,
  initials,
  timeAgo,
  toDateInput,
} from '../utils/format';

const ApplicationDrawer = ({ application, onClose, onSaved, onDeleted }) => {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const panelRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!application) return setForm(null);
    setForm({
      status: application.status,
      notes: application.notes || '',
      contactName: application.contactName || '',
      contactEmail: application.contactEmail || '',
      salaryExpectation: application.salaryExpectation || '',
      followUpAt: toDateInput(application.followUpAt),
    });
  }, [application]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Keyboard users land inside the drawer when it opens and come back to the
  // card they opened it from when it closes.
  useEffect(() => {
    if (!application) return undefined;
    openerRef.current = document.activeElement;
    panelRef.current?.focus();
    return () => openerRef.current?.focus?.();
  }, [application]);

  if (!application || !form) return null;

  const { job } = application;

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/applications/${application._id}`, form);
      onSaved(data.application);
      toast.success('Application updated');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  // Applications almost always ask for the CV, so it is reachable without
  // leaving the drawer.
  const downloadCv = async () => {
    try {
      const response = await api.get('/users/resume', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = user.resumeName || 'cv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/applications/${application._id}`);
      onDeleted(application._id);
      toast.success('Removed from your board');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-dark-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Application for ${job.title}`}
        className="relative flex h-full w-full max-w-lg animate-slide-up flex-col overflow-y-auto bg-white shadow-2xl focus:outline-none dark:bg-dark-900">
        <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-dark-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-50 text-sm font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
            {initials(job.company) || '??'}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-bold leading-snug text-dark-900 dark:text-white">
              {job.title}
            </h2>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              {job.company} · {job.location}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost !p-2" aria-label="Close">
            <FiX />
          </button>
        </header>

        <div className="flex-1 space-y-6 p-5">
          <div className="flex flex-wrap gap-2">
            <Link to={`/jobs/${job.slug}`} className="btn-outline !py-1.5 text-xs">
              View listing
            </Link>
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-outline !py-1.5 text-xs">
              Original posting <FiExternalLink />
            </a>
            {user?.resumeName && (
              <button
                type="button"
                onClick={downloadCv}
                className="btn-outline !py-1.5 text-xs">
                <FiDownload /> My CV
              </button>
            )}
          </div>

          <div>
            <label className="form-label" htmlFor="status">
              Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {APPLICATION_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setForm({ ...form, status })}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    form.status === status
                      ? STATUS_STYLES[status]
                      : 'bg-dark-100 text-dark-500 hover:bg-dark-200 dark:bg-dark-800 dark:text-dark-400'
                  }`}>
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="followUpAt">
              Follow up on
            </label>
            <input
              id="followUpAt"
              type="date"
              className="form-input"
              value={form.followUpAt}
              onChange={(e) => setForm({ ...form, followUpAt: e.target.value })}
            />
            <p className="mt-1 text-xs text-dark-500 dark:text-dark-400">
              Shows up on your dashboard when the date arrives.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="contactName">
                Contact
              </label>
              <input
                id="contactName"
                className="form-input"
                placeholder="Recruiter or hiring manager"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="contactEmail">
                Contact email
              </label>
              <input
                id="contactEmail"
                type="email"
                className="form-input"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="salaryExpectation">
              Salary discussed
            </label>
            <input
              id="salaryExpectation"
              className="form-input"
              placeholder="e.g. $85,000"
              value={form.salaryExpectation}
              onChange={(e) =>
                setForm({ ...form, salaryExpectation: e.target.value })
              }
            />
          </div>

          <div>
            <label className="form-label" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              rows={6}
              className="form-input"
              placeholder="Who you spoke to, what they asked, what to prepare next…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {application.history?.length > 0 && (
            <div>
              <h3 className="form-label">Timeline</h3>
              <ol className="space-y-2 border-l border-dark-200 pl-4 dark:border-dark-800">
                {[...application.history].reverse().map((entry, index) => (
                  <li key={`${entry.status}-${entry.at}-${index}`} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary-500" />
                    <p className="text-sm text-dark-700 dark:text-dark-200">
                      Moved to <span className="capitalize">{entry.status}</span>
                    </p>
                    <p className="text-xs text-dark-400">{timeAgo(entry.at)}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 flex gap-2 border-t border-dark-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
          <button onClick={save} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            onClick={remove}
            className="btn-outline !text-danger-600 hover:!border-danger-300"
            aria-label="Remove from board">
            <FiTrash2 />
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default ApplicationDrawer;
