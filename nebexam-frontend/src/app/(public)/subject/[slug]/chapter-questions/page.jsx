import { subjectsService } from '@/services/subjects.service';
import ChapterQuestionsClient from './ChapterQuestionsClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const res = await subjectsService.getOne(slug);
    return { title: `${res.data.name} Chapter-Wise Questions — NEB Exam` };
  } catch {
    return { title: 'Chapter-Wise Questions — NEB Exam' };
  }
}

export default async function ChapterQuestionsPage({ params }) {
  const { slug } = await params;

  let subject = null;
  try {
    const res = await subjectsService.getOne(slug);
    subject = res.data;
  } catch {}

  // Flatten all chapters in order (direct + from areas)
  const chapters = [];
  if (subject?.direct_chapters?.length) {
    subject.direct_chapters.forEach((ch) => chapters.push({ ...ch, area_name: null }));
  }
  subject?.areas?.forEach((area) => {
    area.chapters?.forEach((ch) => chapters.push({ ...ch, area_name: area.name }));
  });

  return <ChapterQuestionsClient chapters={chapters} subjectSlug={slug} />;
}
