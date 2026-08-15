const KEY = 'talentifyx:last-jobs-query';

// Browsing state lives in the /jobs querystring. Leaving for a full job page and
// coming back would otherwise drop every filter, so the last query is remembered
// and the "back to all roles" links replay it.
export const rememberJobsQuery = (query) => {
  try {
    sessionStorage.setItem(KEY, query);
  } catch {
    // Private-mode browsers can refuse sessionStorage; losing the filters is
    // survivable, throwing here is not.
  }
};

export const lastJobsPath = () => {
  try {
    const query = sessionStorage.getItem(KEY);
    return query ? `/jobs?${query}` : '/jobs';
  } catch {
    return '/jobs';
  }
};
