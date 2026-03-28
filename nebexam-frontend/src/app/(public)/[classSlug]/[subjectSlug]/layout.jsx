import { notFound } from 'next/navigation';
import { subjectsService } from '@/services/subjects.service';
import SubjectHeader from '@/components/subject/SubjectHeader';

const VALID_LEVELS = ['10', '11', '12'];

export default async function SubjectLayout({ children, params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  if (!VALID_LEVELS.includes(level)) notFound();

  const backendSlug = `${subjectSlug}-class-${level}`;
  let subject = null;
  try {
    const res = await subjectsService.getOne(backendSlug);
    subject = res.data;
  } catch {}

  if (!subject) notFound();

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <SubjectHeader subject={subject} slug={backendSlug} />
      {children}
    </div>
  );
}
