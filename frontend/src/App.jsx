import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import WakingNotice from './components/WakingNotice';

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

// The router is created by the caller and passed in, rather than built here.
// main.jsx makes a browser router; scripts/prerender.jsx makes a memory router
// over the same route objects. Defining the provider stack once is the point —
// a prerendered page assembled from a second, hand-kept copy drifts from the
// real app the first time a provider is added, and the failure surfaces as a
// hydration mismatch that blanks the page rather than as anything obviously
// wrong here.
const App = ({ router }) => (
  <ThemeProvider>
    <AuthProvider>
      <WakingNotice />
      <RouterProvider router={router} />
      <Toasts />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
