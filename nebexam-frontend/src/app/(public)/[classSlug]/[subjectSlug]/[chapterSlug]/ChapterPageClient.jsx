'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useChapter from '@/hooks/useChapter';
import useStudyTracker from '@/hooks/useStudyTracker';
import { subjectsService } from '@/services/subjects.service';
import { areasService } from '@/services/areas.service';
import { chaptersService } from '@/services/chapters.service';
import { mediaUrl } from '@/lib/utils';
import QuestionTree from '@/components/question/QuestionTree';
import PdfViewer from '@/components/chapter/PdfViewer';
import RichTextRenderer from '@/components/chapter/RichTextRenderer';


export default function ChapterPageClient() {
  const { classSlug, subjectSlug, chapterSlug } = useParams();
  const { chapter, importantQuestions, loading, error } = useChapter(chapterSlug);
  const [subjectData, setSubjectData] = useState(null);
  const [areas, setAreas] = useState([]);
  const [directChapters, setDirectChapters] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useStudyTracker({
    chapterSlug,
    chapterName:  chapter?.name || '',
    subjectSlug,
    subjectName:  subjectData?.name || '',
  });

  const level = classSlug?.replace('class-', '');
  const resolvedSubjectSlug = chapter?.subject_slug || (subjectSlug ? `${subjectSlug}-class-${level}` : null);
  const subjectBase = classSlug && subjectSlug ? `/${classSlug}/${subjectSlug}` : null;

  // Fetch subject name for breadcrumb (best-effort — subject may not be published)
  useEffect(() => {
    if (!resolvedSubjectSlug) return;
    subjectsService.getOne(resolvedSubjectSlug)
      .then((res) => setSubjectData(res.data))
      .catch(() => {});
  }, [resolvedSubjectSlug]);

  // Fetch areas; if none, fall back to flat chapter list (direct chapters)
  useEffect(() => {
    if (!resolvedSubjectSlug) return;
    areasService.getAll({ subject: resolvedSubjectSlug })
      .then((res) => {
        const fetchedAreas = res.data;
        if (fetchedAreas.length > 0) {
          setAreas(fetchedAreas);
        } else {
          chaptersService.getAll({ subject: resolvedSubjectSlug })
            .then((r) => setDirectChapters(r.data))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [resolvedSubjectSlug]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#1CA3FD] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading chapter…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center text-sm text-slate-500">{error}</div>
  );

  if (!chapter) return null;

  const hasSidebar = areas.length > 0 || directChapters.length > 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">

      {/* ── Top bar ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-1 min-w-0">
              <Link href="/" className="hover:text-[#1CA3FD] transition-colors shrink-0">Home</Link>
              <span>/</span>
              <Link href={`/${classSlug}`} className="hover:text-[#1CA3FD] transition-colors shrink-0">
                Class {level}
              </Link>
              <span>/</span>
              <Link href={subjectBase} className="hover:text-[#1CA3FD] transition-colors truncate max-w-[120px]">
                {subjectData?.name ?? subjectSlug}
              </Link>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-200 font-medium truncate">{chapter.name}</span>
            </div>

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-xs font-medium text-[#1CA3FD] px-3 py-1.5 rounded-lg border border-[#1CA3FD]/30 hover:bg-[#1CA3FD]/5 transition shrink-0"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              Chapters
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile sidebar drawer ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Chapters</span>
              <button
                onClick={() => setSidebarOpen(false)}
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
                currentSlug={chapterSlug}
                subjectBase={subjectBase}
                subject={subjectData}
                onSelect={() => setSidebarOpen(false)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400 p-6 text-center">
                {subjectData ? 'No chapters found.' : 'Loading chapters…'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* ── Left sidebar (desktop) ── */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-[97px] max-h-[calc(100vh-120px)]">
            {hasSidebar ? (
              <ChapterSidebar
                areas={areas}
                directChapters={directChapters}
                currentSlug={chapterSlug}
                subjectBase={subjectBase}
                subject={subjectData}
              />
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="py-4 px-4 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" style={{ width: `${65 + (i % 3) * 10}%` }} />
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 space-y-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              Class {level} {chapter.name} Notes
            </h1>

            {chapter.rich_text_notes && (
              <div
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 md:p-8 select-none"
                onContextMenu={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
              >
                <RichTextRenderer content={chapter.rich_text_notes} />
              </div>
            )}

            {chapter.pdf_notes && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <PdfViewer url={mediaUrl(chapter.pdf_notes)} />
              </div>
            )}

            {importantQuestions.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Important Questions</h2>
                <QuestionTree questions={importantQuestions} hideMeta />
              </div>
            )}

            {!chapter.rich_text_notes && !chapter.pdf_notes && importantQuestions.length === 0 && (
              <div className="text-center py-24">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-slate-400">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">No content available for this chapter yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile floating "Chapters" button ── */}
      <div className="lg:hidden fixed bottom-5 right-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 bg-[#1CA3FD] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg hover:bg-[#1CA3FD]/90 active:scale-95 transition"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          Chapters
        </button>
      </div>
    </div>
  );
}

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

function ChapterSidebar({ areas, directChapters = [], currentSlug, subjectBase, subject, onSelect }) {
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
