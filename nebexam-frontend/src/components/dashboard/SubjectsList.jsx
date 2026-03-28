'use client';

import Link from 'next/link';
import { useState } from 'react';
import { subjectPath } from '@/lib/urls';

export default function SubjectsList({ subjects, level }) {
  const [search, setSearch] = useState('');
  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.subject_code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {level ? `Class ${level} Subjects` : 'Subjects'}
          </h2>
          <span className="text-xs font-medium text-slate-400 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 px-2 py-0.5 rounded-lg">
            {subjects.length}
          </span>
        </div>
        <Link href={level ? `/class-${level}` : '/'} className="text-xs text-[#1CA3FD] font-semibold hover:underline">
          View all →
        </Link>
      </div>

      {subjects.length > 4 && (
        <div className="relative mb-4">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/20 focus:border-[#1CA3FD] focus:bg-white dark:focus:bg-slate-700 transition"
          />
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={subjectPath(s) ?? `/subject/${s.slug}`}
              className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[#1CA3FD]/4 border border-transparent hover:border-[#1CA3FD]/10 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1CA3FD]/8 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#1CA3FD]">
                  {s.subject_code?.slice(0, 2) || s.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#1CA3FD] transition truncate">
                  {s.name}
                </p>
                {s.subject_code && (
                  <p className="text-xs text-slate-400 truncate">{s.subject_code}</p>
                )}
              </div>
              <svg className="text-gray-200 group-hover:text-[#1CA3FD] transition shrink-0" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-2xl flex items-center justify-center mb-3">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-slate-300">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-500">
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
