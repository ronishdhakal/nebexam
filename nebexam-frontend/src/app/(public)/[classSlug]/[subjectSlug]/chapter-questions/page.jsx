import { subjectsService } from '@/services/subjects.service';
import ChapterQuestionsClient from '@/app/(public)/subject/[slug]/chapter-questions/ChapterQuestionsClient';

export async function generateMetadata({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  try {
    const res = await subjectsService.getOne(`${subjectSlug}-class-${level}`);
    return { title: `${res.data.name} Chapter-Wise Questions — NEB Exam` };
  } catch {
    return { title: 'Chapter-Wise Questions — NEB Exam' };
  }
}

export default async function ChapterQuestionsPage({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  const backendSlug = `${subjectSlug}-class-${level}`;

  let subject = null;
  try {
    const res = await subjectsService.getOne(backendSlug);
    subject = res.data;
  } catch {}

  const chapters = [];
  if (subject?.direct_chapters?.length) {
    subject.direct_chapters.forEach((ch) => chapters.push({ ...ch, area_name: null }));
  }
  subject?.areas?.forEach((area) => {
    area.chapters?.forEach((ch) => chapters.push({ ...ch, area_name: area.name }));
  });

  return <ChapterQuestionsClient chapters={chapters} subjectSlug={backendSlug} />;
}
