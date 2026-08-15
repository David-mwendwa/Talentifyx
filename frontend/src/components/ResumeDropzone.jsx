import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiDownload,
  FiEye,
  FiFileText,
  FiTrash2,
  FiUploadCloud,
} from 'react-icons/fi';
import api, { errorMessage } from '../utils/api';
import { formatBytes, formatDate } from '../utils/format';
import ResumePreview from './ResumePreview';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = '.pdf,.doc,.docx';
const ALLOWED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ResumeDropzone = ({ user, onChange }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  // Drag events fire on every child element, so a plain boolean flickers as the
  // pointer moves across the zone. Counting enter/leave pairs keeps it steady.
  const dragDepth = useRef(0);

  const hasResume = Boolean(user.resumeName);

  const send = async (file) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      return toast.error('Upload a PDF, DOC or DOCX file');
    }
    if (file.size > MAX_BYTES) {
      return toast.error('The file must be 5MB or smaller');
    }

    const body = new FormData();
    body.append('resume', file);

    setBusy(true);
    try {
      const { data } = await api.post('/users/resume', body);
      onChange(data.user);
      toast.success('CV uploaded');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const { data } = await api.delete('/users/resume');
      onChange(data.user);
      toast.success('CV removed');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
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

  const onDrop = (e) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    send(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-3">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) setDragging(false);
        }}
        onDrop={onDrop}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={hasResume ? 'Replace your CV' : 'Upload your CV'}
        aria-busy={busy}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
          dragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60'
            : 'border-dark-300 hover:border-primary-400 hover:bg-dark-50 dark:border-dark-700 dark:hover:bg-dark-800/50'
        } ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        <span
          className={`grid h-12 w-12 place-items-center rounded-full text-xl transition ${
            dragging
              ? 'bg-primary-600 text-white'
              : 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
          }`}>
          <FiUploadCloud />
        </span>

        {busy ? (
          <p className="text-sm font-medium text-dark-600 dark:text-dark-300">
            Uploading…
          </p>
        ) : (
          <>
            <p className="text-sm font-semibold text-dark-800 dark:text-dark-100">
              {dragging
                ? 'Drop it here'
                : hasResume
                  ? 'Drag a new file to replace your CV'
                  : 'Drag your CV here, or click to browse'}
            </p>
            <p className="text-xs text-dark-500 dark:text-dark-400">
              PDF, DOC or DOCX · up to 5MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            send(e.target.files?.[0]);
            // Reset so re-picking the same file still fires a change event.
            e.target.value = '';
          }}
        />
      </div>

      {hasResume && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setPreviewing(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setPreviewing(true);
            }
          }}
          aria-label={`Preview ${user.resumeName}`}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-dark-200 p-3 transition hover:border-primary-300 hover:bg-dark-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-dark-800 dark:hover:bg-dark-800/50">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-success-50 text-success-600 dark:bg-success-950 dark:text-success-400">
            <FiFileText />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-dark-800 dark:text-dark-100">
              {user.resumeName}
            </p>
            <p className="text-xs text-dark-500 dark:text-dark-400">
              {formatBytes(user.resumeSize)}
              {user.resumeUploadedAt &&
                ` · uploaded ${formatDate(user.resumeUploadedAt)}`}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewing(true);
            }}
            aria-label="Preview your CV"
            className="btn-ghost !px-2">
            <FiEye />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              download();
            }}
            aria-label="Download your CV"
            className="btn-ghost !px-2">
            <FiDownload />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              remove();
            }}
            disabled={busy}
            aria-label="Remove your CV"
            className="btn-ghost !px-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950">
            <FiTrash2 />
          </button>
        </div>
      )}

      {previewing && (
        <ResumePreview user={user} onClose={() => setPreviewing(false)} />
      )}
    </div>
  );
};

export default ResumeDropzone;
