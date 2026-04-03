import ReferralProgramPageClient from './ReferralProgramPageClient';

export const metadata = {
  title: 'Referral Program — NEB Exam',
  description: 'Refer friends to NEB Exam and earn a 10% commission. Your friends save 10% on their subscription. No limit on referrals.',
  openGraph: {
    title: 'Referral Program — NEB Exam',
    description: 'Refer friends to NEB Exam and earn a 10% commission. Your friends save 10% on their subscription.',
  },
};

export default function ReferralProgramPage() {
  return <ReferralProgramPageClient />;
}
