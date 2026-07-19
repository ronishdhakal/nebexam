import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getChapter,
  getChapterImportantQuestions,
  getSubject,
  getAreasForSubject,
  getChaptersForSubject,
} from '@/lib/cachedContent';
import { flattenSubjectChapters } from '@/lib/chapterList';
import { tiptapToText } from '@/lib/tiptapText';
import { absoluteUrl } from '@/lib/siteUrl';
import { mediaUrl } from '@/lib/utils';
import RichTextRenderer from '@/components/chapter/RichTextRenderer';
import PdfViewerClient from '@/components/chapter/PdfViewerClient';
import ChapterSidebar from '@/components/chapter/ChapterSidebar';
import MobileChapterNav from '@/components/chapter/MobileChapterNav';
import ChapterStudyTracker from '@/components/chapter/ChapterStudyTracker';
import ImportantQuestionsSection from '@/components/chapter/ImportantQuestionsSection';

export const revalidate = 3600;

async function loadChapterContext({ classSlug, subjectSlug, chapterSlug }) {
  const level = classSlug?.replace('class-', '');
  const chapter = await getChapter(chapterSlug);
  if (!chapter) return null;

  const resolvedSubjectSlug = chapter.subject_slug || `${subjectSlug}-class-${level}`;
  const [subject, importantQuestions] = await Promise.all([
    getSubject(resolvedSubjectSlug),
    getChapterImportantQuestions(chapterSlug),
  ]);

  let areas = await getAreasForSubject(resolvedSubjectSlug);
  let directChapters = [];
  if (!areas?.length) {
    directChapters = await getChaptersForSubject(resolvedSubjectSlug);
  }

  return { level, chapter, subject, importantQuestions, areas: areas || [], directChapters };
}

export async function generateMetadata({ params }) {
  const { classSlug, subjectSlug, chapterSlug } = await params;
  const ctx = await loadChapterContext({ classSlug, subjectSlug, chapterSlug });

  if (!ctx?.chapter) {
    return {
      title: 'Chapter Notes — NEB Exam',
      description: 'Chapter notes and important questions for NEB exam preparation.',
    };
  }

  const { level, chapter, subject } = ctx;
  const subjectName = subject?.name || chapter.subject_name;
  const title = `Class ${level} ${chapter.name} Notes and Important Questions — NEB Exam`;
  const notesExcerpt = chapter.rich_text_notes ? tiptapToText(chapter.rich_text_notes, 120) : '';
  const description = notesExcerpt
    ? `Class ${level} ${chapter.name}${subjectName ? ` (${subjectName})` : ''} notes: ${notesExcerpt}`
    : `Class ${level} ${chapter.name} notes and important questions${subjectName ? ` for ${subjectName}` : ''} for NEB exam preparation.`;
  const canonical = `/${classSlug}/${subjectSlug}/${chapterSlug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ChapterPage({ params }) {
  const { classSlug, subjectSlug, chapterSlug } = await params;
  const ctx = await loadChapterContext({ classSlug, subjectSlug, chapterSlug });

  if (!ctx?.chapter) notFound();

  const { level, chapter, subject, importantQuestions, areas, directChapters } = ctx;
  const subjectBase = `/${classSlug}/${subjectSlug}`;
  const hasSidebar = areas.length > 0 || directChapters.length > 0;

  const flatChapters = flattenSubjectChapters(areas, directChapters);
  const currentIndex = flatChapters.findIndex((ch) => ch.slug === chapterSlug);
  const prevChapter = currentIndex > 0 ? flatChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < flatChapters.length - 1 ? flatChapters[currentIndex + 1] : null;
  const otherChapters = flatChapters.filter((ch) => ch.slug !== chapterSlug);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: `Class ${level}`, item: absoluteUrl(`/${classSlug}`) },
      { '@type': 'ListItem', position: 3, name: subject?.name ?? subjectSlug, item: absoluteUrl(subjectBase) },
      { '@type': 'ListItem', position: 4, name: chapter.name, item: absoluteUrl(`${subjectBase}/${chapterSlug}`) },
    ],
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `Class ${level} ${chapter.name} Notes`,
    headline: `Class ${level} ${chapter.name} Notes and Important Questions`,
    educationalLevel: `Grade ${level}`,
    about: subject?.name,
    dateModified: chapter.updated_at || undefined,
    isPartOf: subject?.name
      ? { '@type': 'Course', name: `Class ${level} ${subject.name}` }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'NEB Exam',
    },
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <ChapterStudyTracker
        chapterSlug={chapterSlug}
        chapterName={chapter.name}
        subjectSlug={subjectSlug}
        subjectName={subject?.name || ''}
      />

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
                {subject?.name ?? subjectSlug}
              </Link>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-200 font-medium truncate">{chapter.name}</span>
            </div>

            <MobileChapterNav
              areas={areas}
              directChapters={directChapters}
              currentSlug={chapterSlug}
              subjectBase={subjectBase}
              subject={subject}
            />
          </div>
        </div>
      </div>

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
                subject={subject}
              />
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden p-4">
                <p className="text-sm text-slate-400">No chapters found.</p>
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
                <PdfViewerClient url={mediaUrl(chapter.pdf_notes)} />
                <p className="px-6 py-3 text-xs text-slate-400 border-t border-gray-100 dark:border-slate-700">
                  PDF notes for Class {level} {chapter.name}{subject?.name ? ` (${subject.name})` : ''}. Open the viewer above to read the full document.
                </p>
              </div>
            )}

            <ImportantQuestionsSection questions={importantQuestions} />

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

            {/* ── Prev / Next chapter nav ── */}
            {(prevChapter || nextChapter) && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {prevChapter ? (
                  <Link
                    href={`${subjectBase}/${prevChapter.slug}`}
                    className="group flex items-center gap-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 hover:border-[#1CA3FD]/50 hover:shadow-sm transition-all"
                  >
                    <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-600 flex items-center justify-center shrink-0 group-hover:bg-[#1CA3FD] group-hover:border-[#1CA3FD] transition-all">
                      <svg className="text-slate-400 group-hover:text-white transition-colors" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Previous</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#1CA3FD] truncate transition-colors">{prevChapter.name}</p>
                    </div>
                  </Link>
                ) : <div />}
                {nextChapter ? (
                  <Link
                    href={`${subjectBase}/${nextChapter.slug}`}
                    className="group flex items-center gap-3 justify-end text-right bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 hover:border-[#1CA3FD]/50 hover:shadow-sm transition-all"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Next</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#1CA3FD] truncate transition-colors">{nextChapter.name}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-600 flex items-center justify-center shrink-0 group-hover:bg-[#1CA3FD] group-hover:border-[#1CA3FD] transition-all">
                      <svg className="text-slate-400 group-hover:text-white transition-colors" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </Link>
                ) : <div />}
              </div>
            )}

            {/* ── More chapters in subject ── */}
            {otherChapters.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  More chapters in {subject?.name ?? 'this subject'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {otherChapters.slice(0, 8).map((ch) => (
                    <Link
                      key={ch.id}
                      href={`${subjectBase}/${ch.slug}`}
                      className="text-xs text-slate-600 dark:text-slate-300 hover:text-[#1CA3FD] truncate py-1 transition-colors"
                    >
                      {ch.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
