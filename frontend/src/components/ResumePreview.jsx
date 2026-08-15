import { useEffect, useState } from 'react';
import { FiAlertCircle, FiDownload, FiExternalLink, FiX } from 'react-icons/fi';
import api, { errorMessage } from '../utils/api';
import { formatBytes } from '../utils/format';

// Word files have no native in-browser viewer; only PDFs can actually be shown.
const isPreviewable = (name = '') => name.toLowerCase().endsWith('.pdf');

const ResumePreview = ({ user, onClose }) => {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const previewable = isPreviewable(user.resumeName);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let objectUrl;
    let active = true;

    // The file is behind cookie auth, so it is fetched as a blob and shown from
    // an object URL. That also means the API keeps serving Content-Disposition:
    // attachment — nothing is ever rendered inline straight off the response.
    api
      .get('/users/resume', { responseType: 'blob' })
      .then(({ data }) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(data);
        setUrl(objectUrl);
      })
      .catch((err) => active && setError(errorMessage(err)));

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const download = () => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = user.resumeName || 'cv';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-dark-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview of ${user.resumeName}`}
        className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-dark-900">
        <header className="flex items-center gap-3 border-b border-dark-200 p-4 dark:border-dark-800">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-heading text-base font-semibold text-dark-900 dark:text-white">
              {user.resumeName}
            </h2>
            <p className="text-xs text-dark-500 dark:text-dark-400">
              {formatBytes(user.resumeSize)}
            </p>
          </div>
          <button onClick={download} className="btn-outline !py-1.5 text-xs">
            <FiDownload /> Download
          </button>
          {previewable && url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="btn-outline !py-1.5 text-xs">
              <FiExternalLink /> New tab
            </a>
          )}
          <button onClick={onClose} className="btn-ghost !p-2" aria-label="Close preview">
            <FiX />
          </button>
        </header>

        <div className="flex-1 overflow-hidden bg-dark-100 dark:bg-dark-950">
          {error && (
            <div className="grid h-full place-items-center p-6 text-center">
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          )}

          {!error && !previewable && (
            <div className="grid h-full place-items-center p-6">
              <div className="max-w-sm space-y-3 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-warning-100 text-xl text-warning-600 dark:bg-warning-950 dark:text-warning-400">
                  <FiAlertCircle />
                </span>
                <p className="text-sm font-semibold text-dark-800 dark:text-dark-100">
                  Word documents cannot be previewed in the browser
                </p>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Download the file to check it, or upload a PDF to preview it here
                  — most application portals prefer a PDF anyway.
                </p>
              </div>
            </div>
          )}

          {!error && previewable && !url && (
            <div className="grid h-full place-items-center">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-dark-300 border-t-primary-600" />
            </div>
          )}

          {!error && previewable && url && (
            <iframe
              // The viewer's own thumbnail sidebar is redundant at this size and
              // eats a third of the width; the toolbar stays for zoom and print.
              src={`${url}#navpanes=0&view=FitH`}
              title={`Preview of ${user.resumeName}`}
              className="h-full w-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
