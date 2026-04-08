import Link from 'next/link';
import { notFound } from 'next/navigation';
import { subjectsService } from '@/services/subjects.service';
import SubjectCard from '@/components/subject/SubjectCard';

const VALID_LEVELS = ['8', '9', '10', '11', '12'];

const STREAM_META = {
  science:    { label: 'Science',    color: 'bg-blue-500',    light: 'bg-blue-50 dark:bg-blue-950/30',    border: 'border-blue-100 dark:border-blue-900',    text: 'text-blue-700 dark:text-blue-400',    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/50' },
  management: { label: 'Management', color: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-100 dark:border-emerald-900', text: 'text-emerald-700 dark:text-emerald-400', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50' },
};

function StreamSection({ stream, subjects, level }) {
  const meta = STREAM_META[stream];
  if (!subjects.length) return null;
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-3 h-3 rounded-full ${meta.color}`} />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{meta.label}</h2>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.light} ${meta.border} ${meta.text} border`}>
          {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
        </span>
        <Link
          href={`/class-${level}/${stream}`}
          className={`ml-auto text-xs font-medium ${meta.text} ${meta.hover} px-2.5 py-1 rounded-lg transition-colors`}
        >
          View {meta.label} only →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((s) => <SubjectCard key={s.id} subject={s} />)}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { classSlug } = await params;
  const level = classSlug.replace('class-', '');
  const title = `Class ${level} Notes (Subject & Stream Wise) — NEB Exam`;
  const description = `Class ${level} notes, past papers and model questions — Science & Management streams. Browse all subjects for NEB exam preparation.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function ClassSlugPage({ params }) {
  const { classSlug } = await params;
  const level = classSlug.replace('class-', '');
  if (!VALID_LEVELS.includes(level)) notFound();

  const isStreamed = level === '11' || level === '12';

  let subjects = [];
  try {
    const res = await subjectsService.getAll({ class_level: level });
    subjects = res.data.results || res.data;
  } catch {}

  let scienceSubjects    = [];
  let managementSubjects = [];
  if (isStreamed) {
    subjects.forEach((s) => {
      const hasSci   = s.streams?.includes('science');
      const hasMgmt  = s.streams?.includes('management');
      const noStream = !s.streams?.length;
      if (hasSci || noStream)  scienceSubjects.push(s);
      if (hasMgmt || noStream) managementSubjects.push(s);
    });
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link href="/" className="hover:text-[#1CA3FD] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Class {level}</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Class {level}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {subjects.length} subject{subjects.length !== 1 ? 's' : ''} available
                {isStreamed && ' · Science & Management streams'}
              </p>
            </div>
            {isStreamed && (
              <div className="flex items-center gap-2">
                {Object.entries(STREAM_META).map(([key, meta]) => (
                  <Link
                    key={key}
                    href={`/class-${level}/${key}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${meta.light} ${meta.border} ${meta.text} ${meta.hover}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${meta.color}`} />
                    {meta.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {isStreamed ? (
          <>
            <StreamSection stream="science"    subjects={scienceSubjects}    level={level} />
            {scienceSubjects.length > 0 && managementSubjects.length > 0 && (
              <div className="border-t border-dashed border-slate-200 dark:border-slate-700" />
            )}
            <StreamSection stream="management" subjects={managementSubjects} level={level} />
          </>
        ) : (
          subjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-slate-400">No subjects available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((s) => <SubjectCard key={s.id} subject={s} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}
