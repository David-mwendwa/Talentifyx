import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { FiBell, FiBriefcase, FiGrid, FiTarget, FiUser } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { to: '/dashboard', end: true, label: 'Overview', icon: FiGrid },
  { to: '/dashboard/matches', label: 'Matches', icon: FiTarget },
  { to: '/dashboard/board', label: 'My board', icon: FiBriefcase },
  { to: '/dashboard/searches', label: 'Saved searches', icon: FiBell },
  { to: '/dashboard/profile', label: 'Profile', icon: FiUser },
];

const DashboardLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading label="Loading your dashboard" />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <header className="mb-8">
          <h1 className="section-title">Welcome back, {user.name}</h1>
          <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
            {user.stack.length
              ? `Matching against ${user.stack.join(', ')}`
              : 'Add your stack in Profile to unlock precision matching.'}
          </p>
        </header>

        <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-dark-200 dark:border-dark-800">
          {tabs.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
                    : 'border-transparent text-dark-500 hover:text-dark-800 dark:text-dark-400 dark:hover:text-dark-100'
                }`
              }>
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
