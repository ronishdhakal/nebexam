import ContactPageClient from './ContactPageClient';

export const metadata = {
  title: 'Contact Us — NEB Exam',
  description: 'Get in touch with the NEB Exam team. Report content errors, ask questions, or send feedback. We respond within 24 hours.',
  openGraph: {
    title: 'Contact Us — NEB Exam',
    description: 'Get in touch with the NEB Exam team. Report content errors, ask questions, or send feedback.',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
