import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const NotFound = () => (
  <div className="container grid place-items-center py-24 text-center">
    <div className="space-y-4">
      <p className="font-heading text-6xl font-extrabold text-primary-600 dark:text-primary-400">
        404
      </p>
      <h1 className="section-title">This page does not exist</h1>
      <p className="mx-auto max-w-md text-dark-500 dark:text-dark-400">
        The link may be out of date, or the role it pointed at has been filled.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link to="/jobs" className="btn-primary">
          Browse open roles <FiArrowRight />
        </Link>
        <Link to="/" className="btn-outline">
          Back home
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
