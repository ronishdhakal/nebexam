'use client';

import { useState, useEffect, useRef } from 'react';
import { chaptersService } from '@/services/chapters.service';
import QuestionCard from '@/components/question/QuestionCard';

function ChapterSidebar({ chapters, activeSlug, onSelect, mobileOpen, onClose }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeSlug]);

  const content = (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chapters</p>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {chapters.map((ch, idx) => {
          const isActive = ch.slug === activeSlug;
          return (
            <button
              key={ch.slug}
              ref={isActive ? activeRef : null}
              onClick={() => { onSelect(ch.slug); onClose(); }}
              className={`w-full text-left flex items-start gap-2.5 px-4 py-2.5 transition-colors group ${
                isActive
                  ? 'bg-[#1CA3FD]/8 border-r-2 border-[#1CA3FD]'
                  : 'hover:bg-gray-50 dark:hover:bg-slate-800 border-r-2 border-transparent'
              }`}
            >
              <span className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 transition-colors ${
                isActive ? 'bg-[#1CA3FD] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 group-hover:bg-[#1CA3FD]/10 group-hover:text-[#1CA3FD]'
              }`}>
                {idx + 1}
              </span>
              <span className={`text-xs leading-snug font-medium transition-colors ${
                isActive ? 'text-[#1CA3FD]' : 'text-slate-700 dark:text-slate-300 group-hover:text-[#1CA3FD]'
              }`}>
                {ch.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 sticky top-0 h-[calc(100vh-56px)] overflow-hidden">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-800 shadow-2xl flex flex-col">
            {content}
          </aside>
        </>
      )}
    </>
  );
}

function QuestionsList({ chapterSlug }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterSlug) return;
    setLoading(true);
    setQuestions([]);
    chaptersService.getImportantQuestions(chapterSlug)
      .then((res) => setQuestions(res.data || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [chapterSlug]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No important questions yet</p>
        <p className="text-xs text-slate-400 mt-1">Questions will appear here once added for this chapter.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-3">
      <p className="text-xs text-slate-400 font-medium mb-4">
        {questions.length} question{questions.length !== 1 ? 's' : ''} found
      </p>
      {questions.map((q, idx) => (
        <QuestionCard key={q.id} node={q} index={idx} isNepali={false} depth={0} />
      ))}
    </div>
  );
}

export default function ChapterQuestionsClient({ chapters, subjectSlug }) {
  const [activeSlug, setActiveSlug] = useState(chapters[0]?.slug ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeChapter = chapters.find((c) => c.slug === activeSlug);
  const activeIdx = chapters.findIndex((c) => c.slug === activeSlug);

  const goPrev = () => { if (activeIdx > 0) setActiveSlug(chapters[activeIdx - 1].slug); };
  const goNext = () => { if (activeIdx < chapters.length - 1) setActiveSlug(chapters[activeIdx + 1].slug); };

  if (!chapters.length) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center text-slate-400 text-sm">
        No chapters found for this subject.
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-113px)] lg:h-[calc(100vh-113px)] overflow-hidden">
      <ChapterSidebar
        chapters={chapters}
        activeSlug={activeSlug}
        onSelect={setActiveSlug}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Chapter header bar */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 text-slate-500 hover:text-[#1CA3FD] hover:bg-[#1CA3FD]/5 rounded-lg transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            {activeChapter?.area_name && (
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{activeChapter.area_name}</p>
            )}
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              <span className="text-slate-400 font-normal mr-1.5">Ch {activeIdx + 1}.</span>
              {activeChapter?.name}
            </h2>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={goPrev}
              disabled={activeIdx === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous chapter"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-xs text-slate-400 tabular-nums px-1">{activeIdx + 1}/{chapters.length}</span>
            <button
              onClick={goNext}
              disabled={activeIdx === chapters.length - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next chapter"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        {/* Scrollable questions */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          {activeSlug && <QuestionsList chapterSlug={activeSlug} />}
        </div>
      </div>
    </div>
  );
}
