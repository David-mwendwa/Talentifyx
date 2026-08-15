import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../utils/api';
import Loading from '../components/Loading';
import { timeAgo } from '../utils/format';
import { useTheme } from '../context/ThemeContext';

const SENIORITY_COLORS = {
  internship: '#94a3b8',
  junior: '#22d3ee',
  mid: '#6366f1',
  senior: '#8b5cf6',
  lead: '#f59e0b',
};

const Insights = () => {
  const { dark } = useTheme();
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    api
      .get('/jobs/stats')
      .then(({ data }) => setStats(Array.isArray(data?.demandByStack) ? data : null))
      .catch(() => setStats(null));
    api
      .get('/jobs/filters')
      .then(({ data }) => setMeta(Array.isArray(data?.stacks) ? data : null))
      .catch(() => setMeta(null));
  }, []);

  if (!stats || !meta) return <Loading label="Crunching the market" />;

  const axisColor = dark ? '#94a3b8' : '#64748b';
  const gridColor = dark ? '#1e293b' : '#e2e8f0';

  return (
    <div className="container space-y-10 py-10">
      <header className="space-y-2">
        <h1 className="section-title">Market insights</h1>
        <p className="text-sm text-dark-500 dark:text-dark-400">
          What the {meta.totalJobs} currently listed roles across {meta.totalCompanies}{' '}
          companies are actually asking for.
          {meta.syncedAt && ` Last synced ${timeAgo(meta.syncedAt)}.`}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Open roles', value: meta.totalJobs },
          { label: 'Hiring companies', value: meta.totalCompanies },
          { label: 'Remote-friendly', value: meta.remoteJobs },
          { label: 'Distinct stacks', value: meta.stacks.length },
        ].map((tile) => (
          <div key={tile.label} className="card p-5">
            <p className="font-heading text-3xl font-bold text-dark-900 dark:text-white">
              {tile.value}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-dark-500 dark:text-dark-400">
              {tile.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-6">
          <h2 className="mb-6 font-heading text-lg font-semibold text-dark-900 dark:text-white">
            Most in-demand stacks
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.demandByStack}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="stack" stroke={axisColor} fontSize={12} />
              <YAxis stroke={axisColor} fontSize={12} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: gridColor, opacity: 0.4 }}
                contentStyle={{
                  background: dark ? '#0f172a' : '#fff',
                  border: `1px solid ${gridColor}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="card p-6">
          <h2 className="mb-6 font-heading text-lg font-semibold text-dark-900 dark:text-white">
            Roles by seniority
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={stats.bySeniority}
                dataKey="count"
                nameKey="seniority"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}>
                {stats.bySeniority.map((entry) => (
                  <Cell
                    key={entry.seniority}
                    fill={SENIORITY_COLORS[entry.seniority] || '#6366f1'}
                  />
                ))}
              </Pie>
              <Legend
                formatter={(value) => (
                  <span className="text-xs capitalize text-dark-600 dark:text-dark-300">
                    {value}
                  </span>
                )}
              />
              <Tooltip
                contentStyle={{
                  background: dark ? '#0f172a' : '#fff',
                  border: `1px solid ${gridColor}`,
                  borderRadius: 8,
                  fontSize: 12,
                  textTransform: 'capitalize',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="card p-6">
        <h2 className="mb-5 font-heading text-lg font-semibold text-dark-900 dark:text-white">
          Where the roles are
        </h2>
        <div className="flex flex-wrap gap-2">
          {meta.locations.map((location) => (
            <Link
              key={location.name}
              to={`/jobs?location=${encodeURIComponent(location.name)}`}
              className="chip !px-3 !py-1.5 hover:border-primary-300 hover:text-primary-700">
              {location.name}
              <span className="text-[10px] opacity-60">{location.count}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Insights;
