import { Link } from 'react-router-dom';

const Logo = ({ to = '/', compact = false }) => (
  <Link to={to} className="flex items-center gap-2.5">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 text-white">
      <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          opacity="0.55"
        />
        <circle
          cx="32"
          cy="32"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <circle cx="32" cy="32" r="3" fill="currentColor" />
        <path
          d="M32 6v8M32 50v8M6 32h8M50 32h8"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </span>
    {!compact && (
      <span className="font-heading text-xl font-extrabold tracking-tight text-dark-900 dark:text-white">
        Talentify<span className="text-primary-600 dark:text-primary-400">x</span>
      </span>
    )}
  </Link>
);

export default Logo;
