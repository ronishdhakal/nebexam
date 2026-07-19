import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSubjectsForLevel } from '@/lib/cachedContent';
import { absoluteUrl } from '@/lib/siteUrl';
import SubjectCard from '@/components/subject/SubjectCard';

const VALID_STREAMED = ['11', '12'];

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { classSlug } = await params;
  const level = classSlug.replace('class-', '');
  if (!VALID_STREAMED.includes(level)) return {};

  const title = `Class ${level} Science Notes (Subject Wise) — NEB Exam`;
  const description = `Class ${level} Science stream — chapter notes, past papers and model question sets for NEB exam preparation.`;
  const canonical = `/${classSlug}/science`;
  const all = await getSubjectsForLevel(level);
  const subjects = all.filter((s) => s.streams?.includes('science') || !s.streams?.length);

  return {
    title,
    description,
    alternates: { canonical },
    ...(subjects.length === 0 ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, type: 'website', url: canonical },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SciencePage({ params }) {
  const { classSlug } = await params;
  const level = classSlug.replace('class-', '');
  if (!VALID_STREAMED.includes(level)) notFound();

  const all = await getSubjectsForLevel(level);
  const subjects = all.filter((s) => s.streams?.includes('science') || !s.streams?.length);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: `Class ${level}`, item: absoluteUrl(`/${classSlug}`) },
      { '@type': 'ListItem', position: 3, name: 'Science', item: absoluteUrl(`/${classSlug}/science`) },
    ],
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link href="/" className="hover:text-[#1CA3FD] transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/class-${level}`} className="hover:text-[#1CA3FD] transition-colors">Class {level}</Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Science</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Class {level} — Science</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {subjects.length} subject{subjects.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500 border border-blue-500 text-white">
                <span className="w-2 h-2 rounded-full bg-white" />
                Science
              </span>
              <Link
                href={`/class-${level}/management`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Management
              </Link>
              <Link href={`/class-${level}`} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                All ×
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          Class {level} Science stream notes, syllabus, question banks and past papers for every subject, organized to match the official NEB curriculum.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {subjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-slate-400">No science subjects available yet.</p>
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
