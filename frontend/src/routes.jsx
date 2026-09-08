import { Suspense, lazy } from 'react';
import HomeLayout from './pages/HomeLayout';
import ErrorPage from './pages/ErrorPage';
import Loading from './components/Loading';

// Every page is loaded on demand. The dashboard and Insights were already
// split off — Insights pulls in Recharts, the heaviest dependency here — but
// the public browsing path was not, so someone landing on the marketing page
// downloaded the job list, the job detail panel and the sign-in form with it.
//
// `route()` wraps React.lazy with a preload hook. The wrapper matters for the
// prerendered pages: hydration has to find the same markup the build wrote,
// and a bare React.lazy component renders its Suspense fallback on the first
// pass — which does not match, so React discards the server HTML and the page
// blanks before it repaints. main.jsx preloads the current route's chunk and
// only then hydrates; once the module is in `loaded`, the wrapper renders it
// synchronously and the first paint survives.
const loaded = new Map();

const route = (key, factory) => {
  const Lazy = lazy(factory);
  const Component = (props) => {
    const Ready = loaded.get(key);
    return Ready ? <Ready {...props} /> : <Lazy {...props} />;
  };
  Component.preload = () =>
    factory().then((mod) => {
      loaded.set(key, mod.default);
      return mod;
    });
  return Component;
};

const Landing = route('landing', () => import('./pages/Landing'));
const Jobs = route('jobs', () => import('./pages/Jobs'));
const JobDetail = route('job-detail', () => import('./pages/JobDetail'));
const Login = route('login', () => import('./pages/Login'));
const NotFound = route('not-found', () => import('./pages/NotFound'));
const Insights = route('insights', () => import('./pages/Insights'));
const About = route('about', () => import('./pages/About'));
const Register = route('register', () => import('./pages/Register'));
const DashboardLayout = route('dashboard', () => import('./pages/DashboardLayout'));
const Overview = route('overview', () => import('./pages/Overview'));
const Matches = route('matches', () => import('./pages/Matches'));
const Board = route('board', () => import('./pages/Board'));
const SavedSearches = route('saved-searches', () => import('./pages/SavedSearches'));
const Profile = route('profile', () => import('./pages/Profile'));

const deferred = (element) => <Suspense fallback={<Loading />}>{element}</Suspense>;

// The route objects, not a router. main.jsx builds a browser router from them
// and scripts/prerender.jsx builds a memory router from the same array, so the
// two cannot describe different applications.
export const routeObjects = [
  {
    path: '/',
    element: <HomeLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: deferred(<Landing />) },
      { path: 'jobs', element: deferred(<Jobs />) },
      { path: 'jobs/:slug', element: deferred(<JobDetail />) },
      { path: 'insights', element: deferred(<Insights />) },
      { path: 'about', element: deferred(<About />) },
      { path: 'login', element: deferred(<Login />) },
      { path: 'register', element: deferred(<Register />) },
      { path: '*', element: deferred(<NotFound />) },
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
];

// Only the routes the build prerenders need preloading — they are the only
// ones whose first paint comes from HTML rather than from React. Everything
// else mounts into an empty root, where a Suspense fallback is correct.
const PRELOADERS = {
  '/': Landing,
  '/about': About,
  '/login': Login,
  '/register': Register,
  '/404': NotFound,
};

export const preloadRoute = (pathname) => {
  const key = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const match = PRELOADERS[key] || NotFound;
  return match.preload().catch(() => {});
};
