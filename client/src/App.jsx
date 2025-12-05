import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import {
  HomeLayout,
  Landing,
  Register,
  Login,
  DashboardLayout,
  Error,
  AddJob,
  Stats,
  AllJobs,
  Profile,
  Admin,
  EditJob,
} from './pages';

import { action as registerAction } from './pages/Register';
import { action as loginAction } from './pages/Login';
import { action as addJobAction } from './pages/AddJob';
import { action as editJobAction } from './pages/EditJob';
import { action as deleteJobAction } from './pages/DeleteJob';
import { action as profileAction } from './pages/Profile';
import { loader as dashboardLoader } from './pages/DashboardLayout';
import { loader as allJobsLoader } from './pages/AllJobs';
import { loader as editJobLoader } from './pages/EditJob';
import { loader as adminLoader } from './pages/Admin';
import { loader as statsLoader } from './pages/Stats';

const checkDefaultTheme = () => {
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
  document.body.classList.toggle('dark-theme', isDarkTheme);
  return isDarkTheme;
};
const isDarkThemeEnabled = checkDefaultTheme();

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'register', element: <Register />, action: registerAction },
      { path: 'login', element: <Login />, action: loginAction },
      {
        path: 'dashboard',
        element: <DashboardLayout isDarkThemeEnabled={isDarkThemeEnabled} />,
        loader: dashboardLoader,
        children: [
          {
            index: true,
            element: <AddJob />,
            action: addJobAction,
          },
          {
            path: 'stats',
            element: <Stats />,
            errorElement: <Error />,
            loader: statsLoader,
          },
          {
            path: 'all-jobs',
            element: <AllJobs />,
            errorElement: <Error />,
            loader: allJobsLoader,
          },
          {
            path: 'profile',
            element: <Profile />,
            action: profileAction,
          },
          {
            path: 'admin',
            element: <Admin />,
            loader: adminLoader,
          },
          {
            path: 'edit-job/:id',
            element: <EditJob />,
            loader: editJobLoader,
            action: editJobAction,
          },
          {
            path: 'delete-job/:id',
            action: deleteJobAction,
          },
        ],
      },
    ],
  },
]);

import TailwindTest from './components/TailwindTest';

function App() {
  return <RouterProvider router={router} />;
  // return <TailwindTest />;
}

export default App;
