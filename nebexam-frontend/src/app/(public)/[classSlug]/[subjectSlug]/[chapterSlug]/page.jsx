import { chaptersService } from '@/services/chapters.service';
import { subjectsService } from '@/services/subjects.service';
import ChapterPageClient from './ChapterPageClient';

export async function generateMetadata({ params }) {
  const { classSlug, subjectSlug, chapterSlug } = await params;
  const level = classSlug?.replace('class-', '');

  try {
    const chapterRes = await chaptersService.getOne(chapterSlug);
    const chapter = chapterRes.data;

    // Resolve subject name — prefer chapter's own subject_name, fall back to fetching
    let subjectName = chapter.subject_name;
    if (!subjectName) {
      try {
        const subjSlug = chapter.subject_slug || `${subjectSlug}-class-${level}`;
        const subjRes = await subjectsService.getOne(subjSlug);
        subjectName = subjRes.data.name;
      } catch {}
    }

    const title = `Class ${level} ${chapter.name} Notes and Important Questions — NEB Exam`;
    const description = `Class ${level} ${chapter.name} notes and important questions${subjectName ? ` for ${subjectName}` : ''} for NEB exam preparation.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch {
    return {
      title: `Chapter Notes — NEB Exam`,
      description: 'Chapter notes and important questions for NEB exam preparation.',
    };
  }
}

export default function ChapterPage() {
  return <ChapterPageClient />;
}
