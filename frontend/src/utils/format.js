import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const timeAgo = (date) => dayjs(date).fromNow();

export const formatDate = (date) => (date ? dayjs(date).format('D MMM YYYY') : '');

// <input type="date"> only accepts YYYY-MM-DD.
export const toDateInput = (date) => (date ? dayjs(date).format('YYYY-MM-DD') : '');

export const isOverdue = (date) =>
  Boolean(date) && dayjs(date).isBefore(dayjs(), 'day');

export const isDueToday = (date) =>
  Boolean(date) && dayjs(date).isSame(dayjs(), 'day');

export const formatBytes = (bytes = 0) => {
  if (!bytes) return '0 KB';
  // Anything under a kilobyte rounds to "0 KB", which reads as a failed upload.
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const initials = (company = '') =>
  company
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

export const STATUS_STYLES = {
  saved: 'bg-dark-100 text-dark-700 dark:bg-dark-800 dark:text-dark-200',
  applied: 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
  interview: 'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300',
  offer: 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300',
  rejected: 'bg-danger-100 text-danger-700 dark:bg-danger-950 dark:text-danger-300',
};

export const APPLICATION_STATUSES = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
];

export const SENIORITY_LEVELS = [
  'internship',
  'junior',
  'mid',
  'senior',
  'lead',
];
