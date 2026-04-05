import { subjectsService } from '@/services/subjects.service';
import SubjectHeader from '@/components/subject/SubjectHeader';

export default async function SubjectLayout({ children, params }) {
  const { slug } = await params;
  let subject = null;
  try {
    const res = await subjectsService.getOne(slug);
    subject = res.data;
  } catch {}

  const hasChapters = !!(subject?.areas?.length > 0 || subject?.direct_chapters?.length > 0);
  const hasSyllabus = !!subject?.syllabus;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <SubjectHeader subject={subject} slug={slug} hasChapters={hasChapters} hasSyllabus={hasSyllabus} />
      {children}
    </div>
  );
}
