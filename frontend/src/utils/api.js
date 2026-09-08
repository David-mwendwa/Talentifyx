const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Emitted when a request has been outstanding long enough that the visitor
// deserves an explanation, and again once one comes back. The API sleeps on
// Render's free plan and takes upwards of twenty seconds to wake, which
// without this looks exactly like a broken site.
export const API_SLOW_EVENT = 'talentifyx:api-slow';
export const API_AWAKE_EVENT = 'talentifyx:api-awake';
const SLOW_AFTER_MS = 4000;

let inflight = 0;
let slowTimer = null;

const startedRequest = () => {
  inflight += 1;
  if (inflight === 1 && typeof window !== 'undefined') {
    slowTimer = setTimeout(() => window.dispatchEvent(new Event(API_SLOW_EVENT)), SLOW_AFTER_MS);
  }
};

const finishedRequest = () => {
  inflight = Math.max(0, inflight - 1);
  if (inflight === 0) {
    clearTimeout(slowTimer);
    slowTimer = null;
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(API_AWAKE_EVENT));
  }
};

// axios drops a param only when it is undefined or null — an empty string is
// still sent. Anything stricter changes what the API receives, and the place
// that would notice is a filter that stops clearing itself, so the rule is
// copied exactly rather than tightened.
const queryString = (params) => {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => v !== undefined && v !== null && search.append(key, v));
    } else {
      search.append(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

// Shaped like an axios rejection on purpose: errorMessage below and several
// call sites read `error.response.data.message`, and a network failure has to
// arrive with `error.request` set so it reads as "can't reach the server"
// rather than as a bare JavaScript error.
const httpError = (message, { response, request } = {}) => {
  const error = new Error(message);
  if (response) error.response = response;
  if (request) error.request = request;
  return error;
};

const request = async (method, url, { params, data, headers: extraHeaders } = {}) => {
  const headers = { ...extraHeaders };
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  // FormData must set its own Content-Type, boundary and all — naming it here
  // produces a body the server cannot parse.
  if (data !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

  startedRequest();
  let res;
  try {
    res = await fetch(`${BASE_URL}${url}${queryString(params)}`, {
      method,
      headers,
      // Auth here is an HttpOnly cookie, not a bearer token, so every request
      // has to carry credentials — this is axios's `withCredentials: true`.
      // Dropping it signs every visitor out on the next request.
      credentials: 'include',
      body: data === undefined ? undefined : isFormData ? data : JSON.stringify(data),
    });
  } catch (cause) {
    finishedRequest();
    throw httpError(cause.message || 'Network request failed', { request: true });
  }
  finishedRequest();

  const type = res.headers.get('content-type') || '';
  const text = await res.text().catch(() => '');

  // A misconfigured deployment can answer API calls with the SPA shell on a
  // 200 — static hosts serve index.html for unmatched paths. Parsing that as
  // data fails later and further away, so it is caught here instead.
  if (type.includes('text/html')) {
    throw httpError(
      'The API returned a web page instead of data. Check that VITE_API_URL points at the API and includes /api/v1.'
    );
  }

  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    throw httpError(`Request failed with status code ${res.status}`, {
      response: { status: res.status, data: body },
    });
  }

  return { data: body, status: res.status };
};

export const errorMessage = (error) =>
  error?.response?.data?.message || error.message || 'something went wrong';

// The axios surface this app actually uses, and no more. Replacing the library
// with the four verbs it was called with removes ~13 kB gzipped from the
// critical path for a client that was already mostly a wrapper over fetch.
const api = {
  get: (url, config) => request('GET', url, config),
  post: (url, data, config) => request('POST', url, { ...config, data: data ?? {} }),
  patch: (url, data, config) => request('PATCH', url, { ...config, data: data ?? {} }),
  put: (url, data, config) => request('PUT', url, { ...config, data: data ?? {} }),
  delete: (url, config) => request('DELETE', url, config),
};

export default api;
