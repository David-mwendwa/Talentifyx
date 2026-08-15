import { WORK_MODE } from './constants.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Shared by the jobs list and by saved searches, so a saved search always counts
// exactly what browsing with the same querystring would show.
export const buildJobQuery = ({
  search,
  stack,
  seniority,
  workMode,
  location,
} = {}) => {
  const query = {};

  if (search) {
    const term = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [{ title: term }, { company: term }, { excerpt: term }];
  }
  if (stack) query.stack = { $in: stack.split(',').filter(Boolean) };
  if (seniority) query.seniority = { $in: seniority.split(',').filter(Boolean) };
  if (workMode === WORK_MODE.REMOTE) query.remote = true;
  if (workMode === WORK_MODE.ONSITE) query.remote = false;
  if (location) query.location = new RegExp(escapeRegex(location.trim()), 'i');

  return query;
};
