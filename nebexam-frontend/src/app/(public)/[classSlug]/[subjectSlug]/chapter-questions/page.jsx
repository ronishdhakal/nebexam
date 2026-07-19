import { subjectsService } from '@/services/subjects.service';
import { chaptersService } from '@/services/chapters.service';
import ChapterQuestionsClient from '@/app/(public)/subject/[slug]/chapter-questions/ChapterQuestionsClient';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  try {
    const res = await subjectsService.getOne(`${subjectSlug}-class-${level}`);
    const title = `Class ${level} ${res.data.name} Chapter-Wise Questions — NEB Exam`;
    const description = `Class ${level} ${res.data.name} chapter-wise important questions for NEB exam preparation.`;
    const canonical = `/${classSlug}/${subjectSlug}/chapter-questions`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, type: 'website', url: canonical },
      twitter: { card: 'summary_large_image', title, description },
    };
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

  let initialQuestions = [];
  if (chapters[0]?.slug) {
    try {
      const qRes = await chaptersService.getImportantQuestions(chapters[0].slug);
      initialQuestions = qRes.data || [];
    } catch {}
  }

  return (
    <div>
      <h1 className="sr-only">
        Class {level} {subject?.name ?? ''} Chapter-Wise Important Questions
      </h1>
      <ChapterQuestionsClient chapters={chapters} subjectSlug={backendSlug} initialQuestions={initialQuestions} />
    </div>
  );
}
