'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { studyService } from '@/services/users.service';

const PERIODS = [
  { value: 'daily',   label: 'Last 7 Days' },
  { value: 'weekly',  label: 'Last 4 Weeks' },
  { value: 'monthly', label: 'Last 6 Months' },
];

// Distinct colors for subjects
const COLORS = [
  '#1CA3FD', '#f59e0b', '#10b981', '#8b5cf6',
  '#ef4444', '#06b6d4', '#f97316', '#84cc16',
];

function fmtTime(seconds) {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p) => p.value > 0 && (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.fill }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{fmtTime(p.value)}</span>
        </div>
      ))}
      {payload.length > 1 && (
        <div className="border-t border-gray-100 dark:border-slate-700 mt-2 pt-2 flex justify-between">
          <span className="text-slate-400">Total</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">{fmtTime(total)}</span>
        </div>
      )}
    </div>
  );
}

export default function StudyAnalytics() {
  const [period, setPeriod]     = useState('daily');
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await studyService.getStats(p);
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(period); }, [period, load]);

  // Collect all unique subject names across all bars
  const subjects = data
    ? [...new Set(data.bars.flatMap((b) => Object.keys(b.subjects)))]
    : [];

  // Transform bars into recharts format
  const chartData = data?.bars.map((b) => ({
    label: b.label,
    ...Object.fromEntries(subjects.map((s) => [s, b.subjects[s] || 0])),
  })) ?? [];

  const isEmpty = !data || data.total_seconds === 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Study Analytics</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '—' : fmtTime(data?.total_seconds ?? 0)}
            </span>
            <span className="text-xs text-slate-400">total study time</span>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p.value
                  ? 'bg-white dark:bg-slate-700 text-[#1CA3FD] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-56 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#1CA3FD] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="h-56 flex flex-col items-center justify-center gap-2">
          <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-slate-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-sm text-slate-400 font-medium">No study time recorded yet</p>
          <p className="text-xs text-slate-300">Open a chapter to start tracking</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={subjects.length > 1 ? 14 : 28} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => fmtTime(v)}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              {subjects.length > 1 && (
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  formatter={(v) => <span className="text-slate-500">{v}</span>}
                />
              )}
              {subjects.map((subject, i) => (
                <Bar
                  key={subject}
                  dataKey={subject}
                  stackId="a"
                  fill={COLORS[i % COLORS.length]}
                  radius={i === subjects.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>

          {/* Subject breakdown */}
          {subjects.length > 0 && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {subjects.map((subject, i) => {
                const total = data.bars.reduce((s, b) => s + (b.subjects[subject] || 0), 0);
                const pct   = data.total_seconds > 0 ? Math.round((total / data.total_seconds) * 100) : 0;
                return (
                  <div key={subject} className="bg-gray-50 dark:bg-slate-700/40 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{subject}</span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{fmtTime(total)}</p>
                    <div className="mt-1.5 h-1 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{pct}% of total</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
