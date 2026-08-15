import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

// A misconfigured deployment can answer API calls with the SPA shell on a 200 —
// static hosts serve index.html for unmatched paths. Parsing that as data fails
// later and further away, so it is caught here instead.
api.interceptors.response.use((response) => {
  const type = response.headers?.['content-type'] || '';
  if (typeof response.data === 'string' && type.includes('text/html')) {
    return Promise.reject(
      new Error(
        'The API returned a web page instead of data. Check that VITE_API_URL points at the API and includes /api/v1.'
      )
    );
  }
  return response;
});

export const errorMessage = (error) =>
  error?.response?.data?.message || error.message || 'something went wrong';

export default api;
