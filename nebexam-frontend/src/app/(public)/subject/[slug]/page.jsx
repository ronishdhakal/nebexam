import Link from 'next/link';
import { subjectsService } from '@/services/subjects.service';

function ChapterCard({ chapter, idx }) {
  return (
    <Link
      href={`/chapter/${chapter.slug}`}
      className="group flex items-start gap-3 p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl hover:border-[#1CA3FD]/40 hover:shadow-md transition-all"
    >
      <span className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 group-hover:bg-[#1CA3FD] group-hover:text-white group-hover:border-[#1CA3FD] transition-all mt-0.5">
        {idx + 1}
      </span>
      <div className="min-w-0">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#1CA3FD] transition-colors leading-snug line-clamp-2">
          {chapter.name}
        </span>
        <div className="flex items-center gap-2 mt-1">
          {chapter.rich_text_notes && (
            <span className="text-[10px] text-[#1CA3FD] bg-[#1CA3FD]/8 px-1.5 py-0.5 rounded font-medium">Notes</span>
          )}
          {chapter.pdf_notes && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-medium">PDF</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const res = await subjectsService.getOne(slug);
    const level = res.data.class_level;
    return {
      title: `Class ${level} ${res.data.name} Notes, Important Questions, Syllabus — NEB Exam`,
      description: `Class ${level} ${res.data.name} notes, important questions and syllabus for NEB exam preparation.`,
    };
  } catch {
    return { title: 'Subject — NEB Exam' };
  }
}

export default async function SubjectPage({ params }) {
  const { slug } = await params;
  let subject = null;
  try {
    const res = await subjectsService.getOne(slug);
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

      {/* Direct chapters (no area) */}
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
              <ChapterCard key={chapter.id} chapter={chapter} idx={idx} />
            ))}
          </div>
        </div>
      )}

      {subject.areas?.map((area, areaIdx) => (
        <div key={area.id}>
          {/* Area heading */}
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
              <ChapterCard key={chapter.id} chapter={chapter} idx={idx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
