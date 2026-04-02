'use client';

import { useEffect, useRef } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useChapter from '@/hooks/useChapter';
import { subjectsService } from '@/services/subjects.service';
import { areasService } from '@/services/areas.service';
import { chaptersService } from '@/services/chapters.service';
import { subjectPath } from '@/lib/urls';
import { mediaUrl } from '@/lib/utils';
import QuestionCard from '@/components/question/QuestionCard';
import PdfViewer from '@/components/chapter/PdfViewer';
import RichTextRenderer from '@/components/chapter/RichTextRenderer';

export default function ChapterPageClient() {
  const { slug } = useParams();
  const { chapter, importantQuestions, loading, error } = useChapter(slug);
  const [subjectData, setSubjectData] = useState(null);
  const [areas, setAreas] = useState([]);
  const [directChapters, setDirectChapters] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch subject name for breadcrumb (best-effort)
  useEffect(() => {
    if (chapter?.subject_slug) {
      subjectsService.getOne(chapter.subject_slug)
        .then((res) => setSubjectData(res.data))
        .catch(() => {});
    }
  }, [chapter?.subject_slug]);

  // Fetch areas; if none, fall back to flat chapter list (direct chapters)
  useEffect(() => {
    if (!chapter?.subject_slug) return;
    areasService.getAll({ subject: chapter.subject_slug })
      .then((res) => {
        const fetchedAreas = res.data;
        if (fetchedAreas.length > 0) {
          setAreas(fetchedAreas);
        } else {
          chaptersService.getAll({ subject: chapter.subject_slug })
            .then((r) => setDirectChapters(r.data))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [chapter?.subject_slug]);

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

  const hasNotes = !!chapter.rich_text_notes;
  const hasPdf = !!chapter.pdf_notes;
  const hasQuestions = importantQuestions.length > 0;
  const hasSidebar = areas.length > 0 || directChapters.length > 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">

      {/* ── Top bar ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-1 min-w-0">
              <Link href="/" className="hover:text-[#1CA3FD] transition-colors shrink-0">Home</Link>
              <span>/</span>
              {chapter.subject_slug && (
                <>
                  <Link
                    href={`/class-${chapter.subject_class_level}`}
                    className="hover:text-[#1CA3FD] transition-colors shrink-0"
                  >
                    Class {chapter.subject_class_level}
                  </Link>
                  <span>/</span>
                  <Link
                    href={subjectPath({ slug: chapter.subject_slug, class_level: chapter.subject_class_level }) ?? `/subject/${chapter.subject_slug}`}
                    className="hover:text-[#1CA3FD] transition-colors truncate max-w-[120px]"
                  >
                    {chapter.subject_name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-slate-700 font-medium truncate">{chapter.name}</span>
            </div>

            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
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

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl">
            <ChapterSidebar
              areas={areas}
              directChapters={directChapters}
              currentSlug={slug}
              subject={subjectData}
              onSelect={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* ── Sidebar (desktop) ── */}
          {hasSidebar && (
            <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-[57px] max-h-[calc(100vh-80px)] overflow-y-auto">
              <ChapterSidebar areas={areas} directChapters={directChapters} currentSlug={slug} subject={subjectData} />
            </aside>
          )}

          {/* ── Main content (all sections on one page) ── */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Chapter heading */}
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {chapter.name}
              </h1>
              {chapter.area_name && (
                <p className="text-sm text-slate-500 mt-1">{chapter.area_name}</p>
              )}
            </div>

            {/* Notes */}
            {hasNotes && (
              <section>
                <SectionHeading icon="📄" title="Notes" />
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 md:p-8">
                  <RichTextRenderer content={chapter.rich_text_notes} />
                </div>
              </section>
            )}

            {/* PDF Notes */}
            {hasPdf && (
              <section>
                <SectionHeading icon="📑" title="PDF Notes" />
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <PdfViewer url={mediaUrl(chapter.pdf_notes)} />
                </div>
              </section>
            )}

            {/* Important Questions */}
            {hasQuestions && (
              <section>
                <SectionHeading icon="⭐" title="Important Questions" />
                <ImportantQuestionsSection questions={importantQuestions} />
              </section>
            )}

            {/* Empty state */}
            {!hasNotes && !hasPdf && !hasQuestions && (
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
    </div>
  );
}

function SectionHeading({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-base">{icon}</span>
      <h2 className="text-base font-bold text-slate-800 dark:text-white">{title}</h2>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

const ENTRY_TYPE_LABEL = {
  old_question:   'Old Question',
  model_question: 'Model Question',
};

function ImportantQuestionsSection({ questions }) {
  const manual = questions.filter((q) => q.source === 'manual');
  const bankGroupMap = {};
  questions
    .filter((q) => q.source !== 'manual')
    .forEach((q) => {
      const key = `${q.entry_type ?? 'unknown'}__${q.entry_year ?? ''}`;
      if (!bankGroupMap[key]) {
        bankGroupMap[key] = { entry_type: q.entry_type, entry_year: q.entry_year, questions: [] };
      }
      bankGroupMap[key].questions.push(q);
    });
  const bankGroups = Object.values(bankGroupMap);

  let counter = 0;

  return (
    <div className="space-y-6">
      {manual.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm px-6 py-5 space-y-5">
          {manual.map((node) => (
            <QuestionCard key={node.id} node={node} index={counter++} depth={0} paperMode />
          ))}
        </div>
      )}

      {bankGroups.map((group) => {
        const typeLabel = ENTRY_TYPE_LABEL[group.entry_type] ?? 'Question Bank';
        const headerText = group.entry_year ? `${typeLabel} · ${group.entry_year}` : typeLabel;

        return (
          <div key={`${group.entry_type}__${group.entry_year}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                {headerText}
              </span>
              <div className="flex-1 h-px bg-amber-100" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm px-6 py-5 space-y-5">
              {group.questions.map((node) => (
                <QuestionCard key={node.id} node={node} index={counter++} depth={0} paperMode />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SidebarChapterLink({ chapter, index, isActive, href, activeRef, onSelect }) {
  return (
    <Link
      href={href}
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

function ChapterSidebar({ areas, directChapters = [], currentSlug, subject, onSelect }) {
  const subjBase = subjectPath(subject);
  const activeRef = useRef(null);

  // Scroll active chapter into view on mount
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentSlug]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Sidebar header */}
      <div className="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Subject</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{subject?.name ?? '—'}</p>
        {subject?.class_level && (
          <p className="text-xs text-slate-500 mt-0.5">Class {subject.class_level}</p>
        )}
      </div>

      {/* Chapter list */}
      <div className="py-2">
        {areas.length > 0 ? areas.map((area, aIdx) => (
          <div key={area.id}>
            <div className="flex items-center gap-2 px-4 py-2 mt-1">
              <span className="w-5 h-5 rounded bg-[#1CA3FD]/10 text-[#1CA3FD] text-[10px] font-bold flex items-center justify-center shrink-0">
                {aIdx + 1}
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">{area.name}</span>
            </div>
            {area.chapters?.map((chapter, cIdx) => (
              <SidebarChapterLink key={chapter.id} chapter={chapter} index={cIdx} isActive={chapter.slug === currentSlug} href={subjBase ? `${subjBase}/${chapter.slug}` : `/chapter/${chapter.slug}`} activeRef={activeRef} onSelect={onSelect} />
            ))}
          </div>
        )) : directChapters.map((chapter, cIdx) => (
          <SidebarChapterLink key={chapter.id} chapter={chapter} index={cIdx} isActive={chapter.slug === currentSlug} href={subjBase ? `${subjBase}/${chapter.slug}` : `/chapter/${chapter.slug}`} activeRef={activeRef} onSelect={onSelect} />
        ))}
      </div>

      {/* Back to subject */}
      {subject?.slug && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700">
          <Link
            href={subjBase ?? `/subject/${subject.slug}`}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1CA3FD] transition-colors font-medium"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to {subject.name}
          </Link>
        </div>
      )}
    </div>
  );
}
