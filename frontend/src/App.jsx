import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomeLayout from './pages/HomeLayout';
import Landing from './pages/Landing';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import ErrorPage from './pages/ErrorPage';
import NotFound from './pages/NotFound';
import Loading from './components/Loading';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Split off everything that is not the public browsing path. Insights pulls in
// Recharts, which is the single heaviest dependency in the bundle, and the whole
// dashboard is signed-in only — neither should be in the first load.
const Insights = lazy(() => import('./pages/Insights'));
const About = lazy(() => import('./pages/About'));
const Register = lazy(() => import('./pages/Register'));
const DashboardLayout = lazy(() => import('./pages/DashboardLayout'));
const Overview = lazy(() => import('./pages/Overview'));
const Matches = lazy(() => import('./pages/Matches'));
const Board = lazy(() => import('./pages/Board'));
const SavedSearches = lazy(() => import('./pages/SavedSearches'));
const Profile = lazy(() => import('./pages/Profile'));

const deferred = (element) => (
  <Suspense fallback={<Loading />}>{element}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'jobs', element: <Jobs /> },
      { path: 'jobs/:slug', element: <JobDetail /> },
      { path: 'insights', element: deferred(<Insights />) },
      { path: 'about', element: deferred(<About />) },
      { path: 'login', element: <Login /> },
      { path: 'register', element: deferred(<Register />) },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/dashboard',
    element: deferred(<DashboardLayout />),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: deferred(<Overview />) },
      { path: 'matches', element: deferred(<Matches />) },
      { path: 'board', element: deferred(<Board />) },
      { path: 'searches', element: deferred(<SavedSearches />) },
      { path: 'profile', element: deferred(<Profile />) },
    ],
  },
]);

const Toasts = () => {
  const { dark } = useTheme();
  return (
    <ToastContainer
      position="top-center"
      autoClose={2500}
      theme={dark ? 'dark' : 'light'}
    />
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toasts />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
