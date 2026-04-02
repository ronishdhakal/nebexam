'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';


export default function SubjectHeader({ subject, slug }) {
  const pathname = usePathname();

  // Compute clean URL from subject data; fall back to old /subject/[slug] if unavailable
  let base = `/subject/${slug}`;
  let classHref = subject?.class_level ? `/class-${subject.class_level}` : null;
  if (subject?.slug && subject?.class_level) {
    const level = subject.class_level;
    const nameSlug = subject.slug.replace(new RegExp(`-class-${level}$`), '');
    base = `/class-${level}/${nameSlug}`;
    classHref = `/class-${level}`;
  }

  const allTabs = [
    {
      href: base,
      label: 'Chapters',
      icon: (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
      active: pathname === base || pathname === base + '/',
      show: true,
    },
    {
      href: `${base}/syllabus`,
      label: 'Syllabus',
      icon: (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      ),
      active: pathname.startsWith(`${base}/syllabus`),
      show: true,
    },
    {
      href: `${base}/question-bank`,
      label: 'Question Bank',
      icon: (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      active: pathname.startsWith(`${base}/question-bank`),
      show: true,
    },
    {
      href: `${base}/textbook`,
      label: 'Textbook',
      icon: (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
      active: pathname.startsWith(`${base}/textbook`),
      show: !!(subject?.book_text || subject?.book_pdf),
    },
  ];
  const tabs = allTabs.filter((t) => t.show);

  const totalChapters = subject?.areas?.reduce((s, a) => s + (a.chapters?.length || 0), 0) || 0;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 pb-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Link href="/" className="hover:text-[#1CA3FD] transition-colors">Home</Link>
          <span>/</span>
          {subject && (
            <>
              <Link href={classHref} className="hover:text-[#1CA3FD] transition-colors">
                Class {subject.class_level}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[200px]">
            {subject?.name ?? slug}
          </span>
        </div>

        {/* Subject info */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {subject?.subject_code && (
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                  {subject.subject_code}
                </span>
              )}
              {subject?.streams?.map((s) => (
                <span key={s} className="text-xs capitalize font-semibold bg-[#1CA3FD]/10 text-[#1CA3FD] px-2.5 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {subject?.name ?? '—'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Class {subject?.class_level} · {totalChapters} chapter{totalChapters !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div
          className="flex gap-0 mt-5 -mb-px overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                tab.active
                  ? 'border-[#1CA3FD] text-[#1CA3FD]'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
