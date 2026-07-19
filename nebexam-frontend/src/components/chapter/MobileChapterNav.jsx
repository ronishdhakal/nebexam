'use client';

import { useState } from 'react';
import ChapterSidebar from './ChapterSidebar';

export default function MobileChapterNav({ areas, directChapters, currentSlug, subjectBase, subject }) {
  const [open, setOpen] = useState(false);
  const hasSidebar = areas.length > 0 || directChapters.length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-1.5 text-xs font-medium text-[#1CA3FD] px-3 py-1.5 rounded-lg border border-[#1CA3FD]/30 hover:bg-[#1CA3FD]/5 transition shrink-0"
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        Chapters
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Chapters</span>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            {hasSidebar ? (
              <ChapterSidebar
                areas={areas}
                directChapters={directChapters}
                currentSlug={currentSlug}
                subjectBase={subjectBase}
                subject={subject}
                onSelect={() => setOpen(false)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400 p-6 text-center">
                No chapters found.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="lg:hidden fixed bottom-5 right-4 z-30">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-[#1CA3FD] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg hover:bg-[#1CA3FD]/90 active:scale-95 transition"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          Chapters
        </button>
      </div>
    </>
  );
}
