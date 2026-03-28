import { subjectsService } from '@/services/subjects.service';
import RichTextRenderer from '@/components/chapter/RichTextRenderer';

export async function generateMetadata({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  try {
    const res = await subjectsService.getOne(`${subjectSlug}-class-${level}`);
    return {
      title: `Class ${res.data.class_level} ${res.data.name} Syllabus — NEB Exam`,
      description: `Official syllabus for Class ${res.data.class_level} ${res.data.name} as per NEB curriculum.`,
    };
  } catch {
    return { title: 'Syllabus — NEB Exam' };
  }
}

export default async function SyllabusPage({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  let subject = null;
  try {
    const res = await subjectsService.getOne(`${subjectSlug}-class-${level}`);
    subject = res.data;
  } catch {}

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {subject?.syllabus ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 md:p-10">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Class {subject.class_level} {subject.name} Syllabus
          </h1>
          <RichTextRenderer content={subject.syllabus} />
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-slate-400">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-medium">No syllabus available yet.</p>
          <p className="text-slate-300 text-xs mt-1">Check back later or contact your teacher.</p>
        </div>
      )}
    </div>
  );
}
