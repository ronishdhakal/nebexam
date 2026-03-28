import Link from 'next/link';
import { entriesService } from '@/services/questionbank.service';
import { subjectsService } from '@/services/subjects.service';

export async function generateMetadata({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  try {
    const res = await subjectsService.getOne(`${subjectSlug}-class-${level}`);
    return {
      title: `Class ${res.data.class_level} ${res.data.name} Question Bank — NEB Exam`,
      description: `Past papers and model questions for Class ${res.data.class_level} ${res.data.name} with solutions — NEB exam preparation.`,
    };
  } catch {
    return { title: 'Question Bank — NEB Exam' };
  }
}

function EntryCard({ entry, classSlug, subjectSlug }) {
  return (
    <Link
      href={`/${classSlug}/${subjectSlug}/question-bank/${entry.slug}`}
      className="group flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl hover:bg-[#f8fbff] dark:hover:bg-slate-700 hover:border-[#1CA3FD]/30 transition-all"
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className="shrink-0 text-sm font-bold text-slate-700 dark:text-slate-200 w-12 text-center tabular-nums">
          {entry.year ?? '—'}
        </span>
        <div className="w-px h-8 bg-gray-100 dark:bg-slate-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#1CA3FD] transition-colors leading-snug truncate">
            {entry.title}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {entry.full_marks && (
              <span className="text-xs text-slate-400">Full Marks: <span className="text-slate-600 font-medium">{entry.full_marks}</span></span>
            )}
            {entry.time && (
              <span className="text-xs text-slate-400">Time: <span className="text-slate-600 font-medium">{entry.time}</span></span>
            )}
            {entry.pass_marks && (
              <span className="text-xs text-slate-400">Pass: <span className="text-slate-600 font-medium">{entry.pass_marks}</span></span>
            )}
          </div>
        </div>
      </div>
      <svg className="shrink-0 ml-4 text-slate-300 group-hover:text-[#1CA3FD] transition-colors" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </Link>
  );
}

export default async function QuestionBankListPage({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  const backendSlug = `${subjectSlug}-class-${level}`;

  let entries = [];
  try {
    const res = await entriesService.getAll({ subject: backendSlug });
    entries = res.data.results || res.data;
  } catch {}

  const oldQuestions   = entries.filter((e) => e.type === 'old_question');
  const modelQuestions = entries.filter((e) => e.type === 'model_question');

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="text-slate-400 text-sm">No question papers available yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      {oldQuestions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Old Questions</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">{oldQuestions.length}</span>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
            {oldQuestions.map((entry) => (
              <EntryCard key={entry.id} entry={entry} classSlug={classSlug} subjectSlug={subjectSlug} />
            ))}
          </div>
        </section>
      )}

      {modelQuestions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Model Questions</h2>
            <span className="text-xs text-[#1CA3FD] bg-[#1CA3FD]/10 px-2 py-0.5 rounded-full font-medium">{modelQuestions.length}</span>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
            {modelQuestions.map((entry) => (
              <EntryCard key={entry.id} entry={entry} classSlug={classSlug} subjectSlug={subjectSlug} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
