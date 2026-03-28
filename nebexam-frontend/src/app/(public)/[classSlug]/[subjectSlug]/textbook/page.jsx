import { subjectsService } from '@/services/subjects.service';
import RichTextRenderer from '@/components/chapter/RichTextRenderer';
import PdfViewer from '@/components/chapter/PdfViewer';
import { mediaUrl } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  try {
    const res = await subjectsService.getOne(`${subjectSlug}-class-${level}`);
    return {
      title: `Class ${level} ${res.data.name} Textbook — NEB Exam`,
      description: `Read the official Class ${level} ${res.data.name} textbook notes and PDF for NEB students.`,
    };
  } catch {
    return { title: 'Textbook — NEB Exam' };
  }
}

export default async function TextbookPage({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  let subject = null;
  try {
    const res = await subjectsService.getOne(`${subjectSlug}-class-${level}`);
    subject = res.data;
  } catch {}

  const hasText = !!subject?.book_text;
  const hasPdf = !!subject?.book_pdf;
  const hasContent = hasText || hasPdf;

  if (!hasContent) return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-slate-400">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <p className="text-slate-400 text-sm font-medium">No textbook content available yet.</p>
      <p className="text-slate-300 text-xs mt-1">Check back later.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Class {subject.class_level} {subject.name} Notes
      </h1>

      {hasText && <RichTextRenderer content={subject.book_text} />}

      {hasPdf && <PdfViewer url={mediaUrl(subject.book_pdf)} />}

    </div>
  );
}
