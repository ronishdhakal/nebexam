import Link from 'next/link';
import { subjectsService } from '@/services/subjects.service';

function ChapterCard({ chapter, idx, classSlug, subjectSlug }) {
  const hasNotes = !!chapter.rich_text_notes;
  const hasPdf   = !!chapter.pdf_notes;

  return (
    <Link
      href={`/${classSlug}/${subjectSlug}/${chapter.slug}`}
      className="group flex items-start gap-4 p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl hover:border-[#1CA3FD]/30 hover:shadow-lg hover:shadow-slate-100/60 dark:hover:shadow-slate-900/40 transition-all duration-200"
    >
      {/* Chapter number badge */}
      <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 flex items-center justify-center text-xs font-extrabold text-slate-400 dark:text-slate-500 shrink-0 group-hover:bg-[#1CA3FD] group-hover:text-white group-hover:border-[#1CA3FD] transition-all">
        {String(idx + 1).padStart(2, '0')}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#1CA3FD] transition-colors leading-snug line-clamp-2 mb-2">
          {chapter.name}
        </p>
        <div className="flex items-center gap-2">
          {hasNotes && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1CA3FD] bg-[#EEF6FF] dark:bg-[#1CA3FD]/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1CA3FD]" />
              Notes
            </span>
          )}
          {hasPdf && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              PDF
            </span>
          )}
          {!hasNotes && !hasPdf && (
            <span className="text-[10px] text-slate-300 dark:text-slate-600 font-medium">Coming soon</span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
        className="shrink-0 mt-1 text-slate-200 dark:text-slate-600 group-hover:text-[#1CA3FD] transition-colors">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </Link>
  );
}

export async function generateMetadata({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  try {
    const res = await subjectsService.getOne(`${subjectSlug}-class-${level}`);
    return {
      title: `Class ${res.data.class_level} ${res.data.name} Notes, Important Questions, Syllabus — NEB Exam`,
      description: `Class ${res.data.class_level} ${res.data.name} notes, important questions and syllabus for NEB exam preparation.`,
    };
  } catch {
    return { title: 'Subject — NEB Exam' };
  }
}

export default async function SubjectPage({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  let subject = null;
  try {
    const res = await subjectsService.getOne(`${subjectSlug}-class-${level}`);
    subject = res.data;
  } catch {}

  if (!subject) return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center text-slate-400 text-sm">
      Subject not found.
    </div>
  );

  const hasAreas          = subject.areas?.length > 0;
  const hasDirectChapters = subject.direct_chapters?.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {!hasAreas && !hasDirectChapters && (
        <p className="text-slate-400 text-sm text-center py-16">No chapters available yet.</p>
      )}

      {hasDirectChapters && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Chapters</h2>
            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {subject.direct_chapters.length} chapters
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subject.direct_chapters.map((chapter, idx) => (
              <ChapterCard key={chapter.id} chapter={chapter} idx={idx} classSlug={classSlug} subjectSlug={subjectSlug} />
            ))}
          </div>
        </div>
      )}

      {subject.areas?.map((area, areaIdx) => (
        <div key={area.id}>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-7 h-7 rounded-lg bg-[#1CA3FD] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {areaIdx + 1}
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{area.name}</h2>
            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {area.chapters?.length || 0} chapters
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {area.chapters?.map((chapter, idx) => (
              <ChapterCard key={chapter.id} chapter={chapter} idx={idx} classSlug={classSlug} subjectSlug={subjectSlug} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
