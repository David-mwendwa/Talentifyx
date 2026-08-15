import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import JobDetailPanel from '../components/JobDetailPanel';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import SaveSearchButton from '../components/SaveSearchButton';
import { useSavedJobs } from '../utils/useSavedJobs';
import { rememberJobsQuery } from '../utils/lastJobsQuery';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'a-z', label: 'Title A–Z' },
  { value: 'z-a', label: 'Title Z–A' },
];

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { savedIds, save } = useSavedJobs();
  const [result, setResult] = useState(null);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const previewRef = useRef(null);
  const restoredRef = useRef(false);

  const values = Object.fromEntries(searchParams);

  // The previewed role is kept in the URL so it survives opening a full job page
  // and coming back. It is a view concern, not a filter, so it is stripped out of
  // the request and out of the effect key — selecting a card must not refetch.
  const selectedSlug = searchParams.get('selected');
  const selectedSlugRef = useRef(selectedSlug);
  selectedSlugRef.current = selectedSlug;

  const queryKey = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('selected');
    return params.toString();
  }, [searchParams]);

  const activeFilterCount = ['stack', 'seniority', 'workMode', 'location'].filter(
    (key) => values[key]
  ).length;

  const update = useCallback(
    (patch) => {
      const next = { ...Object.fromEntries(searchParams), ...patch, page: '1' };
      delete next.selected;
      Object.keys(next).forEach((key) => !next[key] && delete next[key]);
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    api.get('/jobs/filters').then(({ data }) => setFilters(data));
  }, []);

  useEffect(() => {
    // Typing in the search box fires overlapping requests; without this guard a
    // slow early response can land after a fast later one and show stale results.
    let current = true;
    setLoading(true);
    api
      .get('/jobs', { params: Object.fromEntries(new URLSearchParams(queryKey)) })
      .then(({ data }) => {
        if (!current) return;
        setResult(data);
        const restored = data.jobs.find(
          (job) => job.slug === selectedSlugRef.current
        );
        setSelected(restored || data.jobs[0] || null);

        // Coming back from a full job page, bring the card back into view rather
        // than dropping the user at the top of a long list.
        if (restored && !restoredRef.current) {
          restoredRef.current = true;
          requestAnimationFrame(() =>
            document
              .getElementById(`job-${restored.slug}`)
              ?.scrollIntoView({ block: 'center' })
          );
        }
      })
      .finally(() => current && setLoading(false));

    return () => {
      current = false;
    };
  }, [queryKey]);

  // Remember the full query, preview included, so the back link on a job page
  // returns to this exact view.
  useEffect(() => {
    rememberJobsQuery(searchParams.toString());
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (searchParams.get('search') || '')) {
        update({ search: searchInput });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchParams, update]);

  // The query can also change from outside this page — a saved search, a stack
  // link, the back button. Without this the stale local value would debounce
  // straight back over it.
  const urlSearch = searchParams.get('search') || '';
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  return (
    <div className="container py-8">
      <header className="mb-6 space-y-2">
        <h1 className="section-title">Browse verified tech roles</h1>
        <p className="text-sm text-dark-500 dark:text-dark-400">
          {result ? `${result.totalJobs} roles match your filters` : 'Loading roles'}
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search role, company or keyword"
            aria-label="Search jobs"
            className="form-input h-11 pl-11"
          />
        </div>
        <select
          aria-label="Sort jobs"
          className="form-input h-11 sm:w-48"
          value={values.sort || 'newest'}
          onChange={(e) => update({ sort: e.target.value })}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SaveSearchButton query={values} />
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="btn-outline h-11 lg:hidden">
          {filtersOpen ? <FiX /> : <FiFilter />} Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary-600 px-1.5 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,420px)_minmax(0,1fr)]">
        <div className={`min-w-0 ${filtersOpen ? '' : 'hidden lg:block'}`}>
          <JobFilters
            filters={filters}
            values={values}
            onChange={update}
            onReset={() => {
              setSearchInput('');
              setSearchParams({});
            }}
          />
        </div>

        <div className="min-w-0">
          {loading && <Loading label="Matching roles" />}

          {!loading && result?.jobs.length === 0 && (
            <EmptyState
              title="No roles match those filters"
              description="Try widening the stack selection, clearing the location, or switching work mode to Any."
            />
          )}

          {!loading && result?.jobs.length > 0 && (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                {result.jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    id={`job-${job.slug}`}
                    job={job}
                    saved={savedIds.has(job._id)}
                    onSave={save}
                    selected={selected?._id === job._id}
                    onSelect={(picked) => {
                      setSelected(picked);
                      setSearchParams(
                        {
                          ...Object.fromEntries(searchParams),
                          selected: picked.slug,
                        },
                        { replace: true }
                      );
                      previewRef.current?.scrollTo({ top: 0 });
                    }}
                  />
                ))}
              </div>
              <Pagination
                currentPage={result.currentPage}
                numOfPages={result.numOfPages}
                onChange={(page) => {
                  setSearchParams({
                    ...Object.fromEntries(searchParams),
                    page: String(page),
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </div>

        {selected && (
          <aside className="hidden min-w-0 xl:block">
            <div
              ref={previewRef}
              className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <JobDetailPanel
                key={selected._id}
                job={selected}
                dense
                saved={savedIds.has(selected._id)}
                onSave={save}
                onApply={() => save(selected, 'applied')}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Jobs;
