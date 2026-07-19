'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

function ChapterLink({ chapter, index, currentSlug, subjectBase, activeRef, onSelect }) {
  const isActive = chapter.slug === currentSlug;
  return (
    <Link
      href={subjectBase ? `${subjectBase}/${chapter.slug}` : `/chapter/${chapter.slug}`}
      onClick={onSelect}
      ref={isActive ? activeRef : null}
      className={`flex items-start gap-2.5 px-4 py-2.5 transition-colors ${
        isActive ? 'bg-[#1CA3FD]/10 border-r-2 border-[#1CA3FD]' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
      }`}
    >
      <span className={`text-[11px] font-bold shrink-0 mt-0.5 w-5 text-right ${isActive ? 'text-[#1CA3FD]' : 'text-slate-300'}`}>
        {index + 1}.
      </span>
      <span className={`text-xs leading-snug ${isActive ? 'font-semibold text-[#1CA3FD]' : 'text-slate-600 dark:text-slate-300 font-medium'}`}>
        {chapter.name}
      </span>
    </Link>
  );
}

export default function ChapterSidebar({ areas, directChapters = [], currentSlug, subjectBase, subject, onSelect }) {
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentSlug]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Subject</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{subject?.name ?? '—'}</p>
        {subject?.class_level && (
          <p className="text-xs text-slate-500 mt-0.5">Class {subject.class_level}</p>
        )}
      </div>

      <div className="py-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {areas.length > 0 ? areas.map((area, aIdx) => (
          <div key={area.id}>
            <div className="flex items-center gap-2 px-4 py-2 mt-1">
              <span className="w-5 h-5 rounded bg-[#1CA3FD]/10 text-[#1CA3FD] text-[10px] font-bold flex items-center justify-center shrink-0">
                {aIdx + 1}
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">{area.name}</span>
            </div>
            {area.chapters?.map((chapter, cIdx) => (
              <ChapterLink key={chapter.id} chapter={chapter} index={cIdx} currentSlug={currentSlug} subjectBase={subjectBase} activeRef={activeRef} onSelect={onSelect} />
            ))}
          </div>
        )) : directChapters.map((chapter, cIdx) => (
          <ChapterLink key={chapter.id} chapter={chapter} index={cIdx} currentSlug={currentSlug} subjectBase={subjectBase} activeRef={activeRef} onSelect={onSelect} />
        ))}
      </div>

      {subjectBase && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 shrink-0">
          <Link
            href={subjectBase}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1CA3FD] transition-colors font-medium"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to {subject?.name ?? 'Subject'}
          </Link>
        </div>
      )}
    </div>
  );
}
