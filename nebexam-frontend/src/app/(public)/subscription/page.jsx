import SubscriptionPageClient from './SubscriptionPageClient';

export const metadata = {
  title: 'Subscription Plans — NEB Exam',
  description: 'Unlock full access to NEB notes, question banks and past papers. Affordable monthly, 3-month and yearly plans for Class 10, 11 & 12 students.',
  openGraph: {
    title: 'Subscription Plans — NEB Exam',
    description: 'Unlock full access to NEB notes, question banks and past papers. Affordable plans for Class 10, 11 & 12 students.',
  },
};

export default function SubscriptionPage() {
  return <SubscriptionPageClient />;
}
