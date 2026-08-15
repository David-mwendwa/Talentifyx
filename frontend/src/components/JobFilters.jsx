import { FiX } from 'react-icons/fi';
import { SENIORITY_LEVELS } from '../utils/format';

const JobFilters = ({ filters, values, onChange, onReset }) => {
  const selectedStack = values.stack ? values.stack.split(',') : [];
  const selectedSeniority = values.seniority ? values.seniority.split(',') : [];

  const toggle = (key, value) => {
    const current = values[key] ? values[key].split(',') : [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ [key]: next.join(',') });
  };

  return (
    <aside className="card h-fit space-y-6 p-5 lg:sticky lg:top-20">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-dark-500 dark:text-dark-400">
          Refine
        </h2>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
          <FiX /> Clear
        </button>
      </div>

      <div className="space-y-2">
        <label className="form-label">Work mode</label>
        <div className="flex gap-2">
          {[
            { value: '', label: 'Any' },
            { value: 'remote', label: 'Remote' },
            { value: 'onsite', label: 'On-site' },
          ].map((mode) => (
            <button
              key={mode.label}
              onClick={() => onChange({ workMode: mode.value })}
              className={
                values.workMode === mode.value
                  ? 'chip-primary !px-3 !py-1.5'
                  : 'chip !px-3 !py-1.5 hover:border-primary-300'
              }>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="form-label">Seniority</label>
        <div className="flex flex-wrap gap-2">
          {SENIORITY_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => toggle('seniority', level)}
              className={
                selectedSeniority.includes(level)
                  ? 'chip-primary !px-3 !py-1.5 capitalize'
                  : 'chip !px-3 !py-1.5 capitalize hover:border-primary-300'
              }>
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="form-label" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          className="form-input"
          placeholder="Berlin, London…"
          value={values.location || ''}
          onChange={(e) => onChange({ location: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="form-label">Stack</label>
        <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto pr-1">
          {(filters?.stacks || []).map(({ name, count }) => (
            <button
              key={name}
              onClick={() => toggle('stack', name)}
              className={
                selectedStack.includes(name)
                  ? 'chip-primary !px-3 !py-1.5'
                  : 'chip !px-3 !py-1.5 hover:border-primary-300'
              }>
              {name}
              <span className="text-[10px] opacity-60">{count}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default JobFilters;
