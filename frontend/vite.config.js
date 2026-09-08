import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The API is on a different origin to the site, so the browser cannot start
// talking to it until it has done a DNS lookup and a TLS handshake it only
// discovers it needs once the JavaScript runs. Announcing the origin in the
// HTML lets both happen in parallel with the bundle download — which matters
// more here than most places, because the API is on a free plan that can take
// twenty-four seconds to answer the first request.
//
// Derived from the env rather than written down, so it cannot point at last
// month's backend, and skipped for a same-origin or localhost value where
// preconnecting buys nothing.
const apiPreconnect = (apiUrl) => ({
  name: 'api-preconnect',
  transformIndexHtml(html) {
    if (!apiUrl || apiUrl.startsWith('/')) return html;
    let origin;
    try {
      origin = new URL(apiUrl).origin;
    } catch {
      return html;
    }
    if (/localhost|127\.0\.0\.1/.test(origin)) return html;
    return html.replace(
      '</head>',
      `  <link rel="preconnect" href="${origin}" crossorigin />\n    <link rel="dns-prefetch" href="${origin}" />\n  </head>`
    );
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), apiPreconnect(env.VITE_API_URL)],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5004',
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          // React and the router change only when they are upgraded, while app
          // code changes every deploy. Splitting them means a returning visitor
          // re-downloads what actually changed rather than the whole bundle.
          manualChunks: (id) =>
            /node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//.test(id)
              ? 'react'
              : undefined,
        },
      },
      // Recharts is the one thing above this and it belongs only to /insights,
      // which is lazy. Sized so the build stays quiet when nothing is wrong —
      // a warning that always fires is one nobody reads.
      chunkSizeWarningLimit: 420,
    },
  };
});
