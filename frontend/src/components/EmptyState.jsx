import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ title, description, action }) => (
  <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
    <span className="grid h-12 w-12 place-items-center rounded-full bg-dark-100 text-xl text-dark-500 dark:bg-dark-800 dark:text-dark-400">
      <FiInbox />
    </span>
    <h3 className="font-heading text-lg font-semibold text-dark-900 dark:text-white">
      {title}
    </h3>
    {description && (
      <p className="max-w-md text-sm text-dark-500 dark:text-dark-400">
        {description}
      </p>
    )}
    {action}
  </div>
);

export default EmptyState;
