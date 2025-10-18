import { useMemo } from 'react';
import classNames from 'classnames';

const TIMELINE_OPTIONS = ['Full-time', 'Part-time', 'Hybrid', 'Contract', 'Internship'];
const ANNOUNCED_OPTIONS = ['Last 24 hours', 'Last 3 days', 'Last 2 weeks', 'Last 3 months', 'Trending'];
const DOMAINS = ['Technology', 'Sales', 'Finance', 'Legal', 'Operations', 'Healthcare', 'Creative'];

const FilterSidebar = ({ filters, onChange }) => {
  const tags = useMemo(
    () =>
      [
        filters.tenure && `${filters.tenure}+ yrs`,
        filters.domain,
        filters.timeline,
        filters.niche
      ].filter(Boolean),
    [filters]
  );

  return (
    <aside className="flex flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl shadow-black/50">
      <div>
        <h2 className="font-display text-lg font-semibold text-white">Tune opportunities</h2>
        <p className="text-sm text-zinc-400">Filters are optional — we prefill trending roles for you.</p>
      </div>

      <div className="space-y-5 text-sm text-zinc-200">
        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-400">Spot</label>
          <input
            type="text"
            value={filters.spot}
            onChange={(event) => onChange('spot', event.target.value)}
            placeholder="City, region, remote"
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-oasis-primary focus:outline-none focus:ring-2 focus:ring-oasis-primary/40"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-400">Timeline</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIMELINE_OPTIONS.map((option) => {
              const active = filters.timeline === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange('timeline', active ? '' : option)}
                  className={classNames(
                    'rounded-full border px-3 py-1 text-xs transition',
                    active
                      ? 'border-oasis-primary bg-oasis-primary/10 text-oasis-primary'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-600 hover:text-white'
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-400">Announced by teams</label>
          <select
            value={filters.announced}
            onChange={(event) => onChange('announced', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white focus:border-oasis-primary focus:outline-none focus:ring-2 focus:ring-oasis-primary/40"
          >
            <option value="">Anytime</option>
            {ANNOUNCED_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-400">Tenure</label>
          <input
            type="number"
            min="0"
            value={filters.tenure}
            onChange={(event) => onChange('tenure', event.target.value)}
            placeholder="Years of experience"
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-oasis-primary focus:outline-none focus:ring-2 focus:ring-oasis-primary/40"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-400">Domain</label>
          <select
            value={filters.domain}
            onChange={(event) => onChange('domain', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white focus:border-oasis-primary focus:outline-none focus:ring-2 focus:ring-oasis-primary/40"
          >
            <option value="">Any field</option>
            {DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-400">Role</label>
          <input
            type="text"
            value={filters.role}
            onChange={(event) => onChange('role', event.target.value)}
            placeholder="Software engineer, driver..."
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-oasis-primary focus:outline-none focus:ring-2 focus:ring-oasis-primary/40"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-400">Niche</label>
          <input
            type="text"
            value={filters.niche}
            onChange={(event) => onChange('niche', event.target.value)}
            placeholder="Python, hospitality, US law..."
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-oasis-primary focus:outline-none focus:ring-2 focus:ring-oasis-primary/40"
            disabled={!filters.domain}
          />
          {!filters.domain && (
            <p className="mt-1 text-xs text-zinc-500">Pick a domain to unlock niche filters.</p>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="rounded-2xl border border-oasis-primary/30 bg-oasis-primary/5 p-4">
          <p className="text-xs uppercase tracking-wide text-oasis-primary">Active filters</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-oasis-primary/10 px-3 py-1 text-oasis-primary"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 text-xs font-semibold text-oasis-primary underline-offset-4 hover:underline"
            onClick={() => onChange('reset')}
          >
            Clear all
          </button>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
