import { Link, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  const is404 = error?.status === 404;

  return (
    <div className="container grid min-h-screen place-items-center py-20 text-center">
      <div className="space-y-4">
        <p className="font-heading text-6xl font-extrabold text-primary-600 dark:text-primary-400">
          {is404 ? '404' : 'Oops'}
        </p>
        <h1 className="section-title">
          {is404 ? 'We could not find that page' : 'Something went wrong'}
        </h1>
        <p className="text-dark-500 dark:text-dark-400">
          {is404
            ? 'The role you are looking for may have been filled or removed.'
            : error?.message || 'Please try again in a moment.'}
        </p>
        <Link to="/jobs" className="btn-primary">
          Browse open roles
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
