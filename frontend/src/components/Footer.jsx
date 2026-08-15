import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import Logo from './Logo';

const LINKS = [
  { to: '/jobs', label: 'Browse jobs' },
  { to: '/insights', label: 'Market insights' },
  { to: '/about', label: 'About' },
  { to: '/register', label: 'Create profile' },
];

const Footer = () => (
  <footer className="mt-20 border-t border-dark-200 bg-white dark:border-dark-800 dark:bg-dark-950">
    <div className="container flex flex-col gap-8 py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-dark-500 dark:text-dark-400">
            Where top talent meets precision matching. Live roles sourced from the
            open{' '}
            <a
              href="https://www.arbeitnow.com/"
              target="_blank"
              rel="noreferrer"
              className="text-primary-600 hover:underline dark:text-primary-400">
              Arbeitnow
            </a>{' '}
            job board API.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-dark-500 dark:text-dark-400">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-primary-600 dark:hover:text-primary-400">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-col-reverse items-center gap-3 border-t border-dark-200 pt-6 text-sm text-dark-500 sm:flex-row sm:justify-between dark:border-dark-800 dark:text-dark-400">
        <p>© {new Date().getFullYear()} Talentifyx</p>
        <p className="flex items-center gap-2">
          Developed by{' '}
          <a
            href="https://techdave.netlify.app/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-dark-700 hover:text-primary-600 dark:text-dark-200 dark:hover:text-primary-400">
            David <FiExternalLink />
          </a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
