import Link from 'next/link';
import { notFound } from 'next/navigation';
import { subjectsService } from '@/services/subjects.service';
import SubjectCard from '@/components/subject/SubjectCard';

const VALID_STREAMED = ['11', '12'];

export async function generateMetadata({ params }) {
  const { classSlug } = await params;
  const level = classSlug.replace('class-', '');
  return {
    title: `Class ${level} Management Notes (Subject Wise) — NEB Exam`,
    description: `Class ${level} Management stream — chapter notes, past papers and model question sets for NEB exam preparation.`,
  };
}

export default async function ManagementPage({ params }) {
  const { classSlug } = await params;
  const level = classSlug.replace('class-', '');
  if (!VALID_STREAMED.includes(level)) notFound();

  let subjects = [];
  try {
    const res = await subjectsService.getAll({ class_level: level });
    const all = res.data.results || res.data;
    subjects = all.filter((s) => s.streams?.includes('management') || !s.streams?.length);
  } catch {}

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link href="/" className="hover:text-[#1CA3FD] transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/class-${level}`} className="hover:text-[#1CA3FD] transition-colors">Class {level}</Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Management</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Class {level} — Management</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {subjects.length} subject{subjects.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/class-${level}/science`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Science
              </Link>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500 border border-emerald-500 text-white">
                <span className="w-2 h-2 rounded-full bg-white" />
                Management
              </span>
              <Link href={`/class-${level}`} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                All ×
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {subjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-slate-400">No management subjects available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((s) => <SubjectCard key={s.id} subject={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
