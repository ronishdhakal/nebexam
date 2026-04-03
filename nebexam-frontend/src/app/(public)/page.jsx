import HomePageClient from './HomePageClient';

export const metadata = {
  title: 'NEB Exam — Free Notes, Question Bank & Past Papers for Class 10, 11 & 12',
  description: 'Study smarter for Nepal\'s NEB exams. Free chapter notes, past papers, model questions and question bank for Class 10, 11 & 12 — Science and Management streams.',
  openGraph: {
    title: 'NEB Exam — Free Notes, Question Bank & Past Papers for Class 10, 11 & 12',
    description: 'Study smarter for Nepal\'s NEB exams. Free chapter notes, past papers, model questions and question bank for Class 10, 11 & 12.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEB Exam — Free Notes, Question Bank & Past Papers for Class 10, 11 & 12',
    description: 'Study smarter for Nepal\'s NEB exams. Free chapter notes, past papers, model questions and question bank for Class 10, 11 & 12.',
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
