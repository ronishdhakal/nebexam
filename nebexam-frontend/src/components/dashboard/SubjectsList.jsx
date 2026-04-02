'use client';

import Link from 'next/link';
import { useState } from 'react';
import { subjectPath } from '@/lib/urls';

// A fixed palette of soft accent colors cycled per subject
const ACCENTS = [
  'text-[#1CA3FD] bg-[#1CA3FD]/8',
  'text-violet-600 bg-violet-50',
  'text-emerald-600 bg-emerald-50',
  'text-amber-600 bg-amber-50',
  'text-rose-600 bg-rose-50',
  'text-indigo-600 bg-indigo-50',
  'text-teal-600 bg-teal-50',
  'text-orange-600 bg-orange-50',
];

export default function SubjectsList({ subjects, level }) {
  const [search, setSearch] = useState('');

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.subject_code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-col shadow-sm p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-foreground">
            {level ? `Class ${level} Subjects` : 'Subjects'}
          </h2>
          {subjects.length > 0 && (
            <span className="text-xs font-semibold text-slate-400 dark:text-muted bg-gray-50 dark:bg-surface-2 border border-gray-100 dark:border-border-col px-2 py-0.5 rounded-lg">
              {subjects.length}
            </span>
          )}
        </div>
        {level && (
          <Link
            href={`/class-${level}`}
            className="text-xs font-semibold text-[#1CA3FD] hover:text-[#0e8fe0] transition"
          >
            View all →
          </Link>
        )}
      </div>

      {/* Search */}
      {subjects.length > 5 && (
        <div className="relative mb-4">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-100 dark:border-border-col rounded-xl bg-gray-50 dark:bg-surface-2 text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/20 focus:border-[#1CA3FD] focus:bg-white dark:focus:bg-surface transition"
          />
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {filtered.map((s, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const abbr   = s.subject_code?.slice(0, 2) || s.name.slice(0, 2).toUpperCase();
            return (
              <Link
                key={s.id}
                href={subjectPath(s) ?? `/subject/${s.slug}`}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-2 border border-transparent hover:border-gray-100 dark:hover:border-border-col transition"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                  <span className="text-[11px] font-extrabold">{abbr}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-foreground group-hover:text-[#1CA3FD] transition truncate">
                    {s.name}
                  </p>
                  {s.subject_code && (
                    <p className="text-[10px] text-slate-400 dark:text-muted font-medium truncate">{s.subject_code}</p>
                  )}
                </div>
                <svg className="text-slate-200 dark:text-border-col group-hover:text-[#1CA3FD] transition shrink-0" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 bg-gray-50 dark:bg-surface-2 border border-gray-100 dark:border-border-col rounded-2xl flex items-center justify-center mb-3">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-slate-300 dark:text-muted">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-muted">
            {search ? 'No subjects match your search.' : 'No subjects available yet.'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-2 text-xs text-[#1CA3FD] font-semibold hover:underline">
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
