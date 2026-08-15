import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiBriefcase,
  FiChevronDown,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSearch,
  FiSun,
  FiUser,
  FiX,
} from 'react-icons/fi';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { initials } from '../utils/format';

const LINKS = [
  { to: '/jobs', label: 'Browse jobs' },
  { to: '/insights', label: 'Market insights' },
  { to: '/about', label: 'About' },
];

const ACCOUNT_LINKS = [
  { to: '/dashboard', label: 'Overview', icon: FiGrid, end: true },
  { to: '/dashboard/board', label: 'My board', icon: FiBriefcase },
  { to: '/dashboard/searches', label: 'Saved searches', icon: FiBell },
  { to: '/dashboard/profile', label: 'Profile', icon: FiUser },
];

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState('');
  const accountRef = useRef(null);

  // Navigating with either menu open used to leave it hanging over the new
  // page, so both close whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // The mobile sheet takes over the screen; letting the page scroll behind it
  // is disorienting.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!accountOpen) return undefined;
    const onPointerDown = (e) => {
      if (!accountRef.current?.contains(e.target)) setAccountOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setAccountOpen(false);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/jobs?search=${encodeURIComponent(search.trim())}` : '/jobs');
    setSearch('');
  };

  // Pages that already put a search field on screen — the landing hero and the
  // browse page — do not get a second one in the header. Beyond looking
  // redundant, two inputs writing the same query string fight over it.
  const OWN_SEARCH = ['/', '/jobs'];
  const showSearch = !OWN_SEARCH.includes(location.pathname);

  const navClass = ({ isActive }) =>
    `relative py-5 text-sm font-medium transition hover:text-primary-600 dark:hover:text-primary-400 ${
      isActive
        ? 'text-primary-600 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary-600 dark:text-primary-400 dark:after:bg-primary-400'
        : 'text-dark-600 dark:text-dark-300'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-dark-200 bg-white/90 backdrop-blur dark:border-dark-800 dark:bg-dark-950/90">
      <nav className="container flex h-16 items-center gap-4">
        <Logo />

        <div className="ml-2 hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Search follows the reader onto pages that have none of their own. */}
        <form
          onSubmit={submitSearch}
          className={`ml-auto hidden ${showSearch ? 'lg:block' : ''}`}>
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles"
              aria-label="Search roles"
              className="form-input h-9 w-48 rounded-full pl-9 text-sm transition focus:w-64"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="btn-ghost h-9 w-9 !p-0">
            {dark ? <FiSun /> : <FiMoon />}
          </button>

          {/* Until the session check returns we do not know which controls
              belong here. Rendering the signed-out pair on a hunch makes them
              flash away for anyone who is in fact logged in. */}
          {loading ? (
            <div
              aria-hidden="true"
              className="hidden h-9 w-28 animate-pulse rounded-full bg-dark-100 md:block dark:bg-dark-800"
            />
          ) : user ? (
            <div className="relative hidden md:block" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((o) => !o)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-dark-200 py-1 pl-1 pr-2.5 transition hover:border-primary-400 dark:border-dark-700">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-xs font-bold text-white">
                  {initials(`${user.name} ${user.lastName}`) || 'U'}
                </span>
                <span className="max-w-[7rem] truncate text-sm font-medium text-dark-700 dark:text-dark-200">
                  {user.name}
                </span>
                <FiChevronDown
                  className={`text-dark-400 transition ${accountOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 animate-fade-in overflow-hidden rounded-xl border border-dark-200 bg-white shadow-card-hover dark:border-dark-800 dark:bg-dark-900">
                  <div className="border-b border-dark-200 px-4 py-3 dark:border-dark-800">
                    <p className="truncate text-sm font-semibold text-dark-900 dark:text-white">
                      {user.name} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-dark-500 dark:text-dark-400">
                      {user.email}
                    </p>
                  </div>
                  {ACCOUNT_LINKS.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      role="menuitem"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-dark-50 dark:hover:bg-dark-800 ${
                          isActive
                            ? 'font-semibold text-primary-600 dark:text-primary-400'
                            : 'text-dark-700 dark:text-dark-200'
                        }`
                      }>
                      <Icon /> {label}
                    </NavLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full items-center gap-3 border-t border-dark-200 px-4 py-2.5 text-sm text-danger-600 transition hover:bg-danger-50 dark:border-dark-800 dark:hover:bg-danger-950">
                    <FiLogOut /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary">
                Create profile
              </Link>
            </div>
          )}

          <button
            className="btn-ghost h-9 w-9 !p-0 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-dark-200 bg-white px-6 py-5 md:hidden dark:border-dark-800 dark:bg-dark-950">
          {showSearch && (
          <form onSubmit={submitSearch} className="relative mb-5">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles"
              aria-label="Search roles"
              className="form-input h-11 pl-11"
            />
          </form>
          )}

          <div className="flex flex-col">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `border-b border-dark-100 py-3 text-base font-medium dark:border-dark-800 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-dark-700 dark:text-dark-200'
                  }`
                }>
                {link.label}
              </NavLink>
            ))}
          </div>

          {loading ? (
            <div
              aria-hidden="true"
              className="mt-6 h-11 animate-pulse rounded-lg bg-dark-100 dark:bg-dark-800"
            />
          ) : user ? (
            <div className="mt-5 space-y-1">
              <p className="px-1 pb-2 text-xs font-bold uppercase tracking-wide text-dark-400">
                Your account
              </p>
              {ACCOUNT_LINKS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-1 py-2.5 text-base ${
                      isActive
                        ? 'font-semibold text-primary-600 dark:text-primary-400'
                        : 'text-dark-700 dark:text-dark-200'
                    }`
                  }>
                  <Icon /> {label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-base text-danger-600">
                <FiLogOut /> Sign out
              </button>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              <Link to="/login" className="btn-outline">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary">
                Create profile
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
