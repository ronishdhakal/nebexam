import { notFound } from 'next/navigation';
import { subjectsService } from '@/services/subjects.service';
import SubjectHeader from '@/components/subject/SubjectHeader';
import StudyAbroadModal from '@/components/leads/StudyAbroadModal';

const VALID_LEVELS = ['8', '9', '10', '11', '12'];

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

  const hasChapters = !!(subject.areas?.length > 0 || subject.direct_chapters?.length > 0);
  const hasSyllabus = !!subject.syllabus;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {level === '12' && <StudyAbroadModal />}
      <SubjectHeader subject={subject} slug={backendSlug} hasChapters={hasChapters} hasSyllabus={hasSyllabus} />
      {children}
    </div>
  );
}
