import { chaptersService } from '@/services/chapters.service';
import ChapterPageClient from './ChapterPageClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const res = await chaptersService.getOne(slug);
    const chapter = res.data;

    const level = chapter.subject_class_level;
    const subjectName = chapter.subject_name;
    const levelPrefix = level ? `Class ${level} ` : '';
    const title = `${levelPrefix}${chapter.name} Notes and Important Questions — NEB Exam`;
    const description = `${levelPrefix}${chapter.name} notes and important questions${subjectName ? ` for ${subjectName}` : ''} for NEB exam preparation.`;

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
      title: 'Chapter Notes — NEB Exam',
      description: 'Chapter notes and important questions for NEB exam preparation.',
    };
  }
}

export default function ChapterPage() {
  return <ChapterPageClient />;
}
