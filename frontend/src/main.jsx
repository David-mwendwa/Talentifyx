import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { routeObjects, preloadRoute } from './routes';

const container = document.getElementById('root');
const router = createBrowserRouter(routeObjects);
const tree = (
  <React.StrictMode>
    <App router={router} />
  </React.StrictMode>
);

// Netlify answers a path it has no file for with the SPA fallback, which is
// index.html — the prerendered *landing page*, markup and all. So a non-empty
// root is not on its own permission to hydrate: on /jobs/some-role it holds
// the landing page, and adopting it would make React reconcile a job listing
// against marketing copy, discard the document and log error #418 for every
// visitor on every route the build did not prerender.
//
// The build stamps each prerendered file with the route it was rendered for,
// and only a match is adopted. Everything else mounts fresh, which is what
// used to happen for all fourteen routes anyway.
const normalise = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p);
const prerenderedFor = container.dataset.prerendered;
const canHydrate =
  container.hasChildNodes() &&
  prerenderedFor &&
  normalise(prerenderedFor) === normalise(window.location.pathname);

// The preload is not optional. Routes are lazy, and a lazy component suspends
// on its first render; hydrating against server HTML while suspended makes
// React discard the markup it was handed, which shows up as the page appearing
// and then blanking. Waiting for the one chunk this URL needs costs a few
// milliseconds and keeps the paint.
if (canHydrate) {
  preloadRoute(window.location.pathname).then(() => ReactDOM.hydrateRoot(container, tree));
} else {
  ReactDOM.createRoot(container).render(tree);
}
