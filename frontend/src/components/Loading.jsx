const Loading = ({ label = 'Loading' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-dark-200 border-t-primary-600 dark:border-dark-700 dark:border-t-primary-500" />
    <p className="text-sm text-dark-500 dark:text-dark-400">{label}...</p>
  </div>
);

export default Loading;
