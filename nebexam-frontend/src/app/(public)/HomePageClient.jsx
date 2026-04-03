'use client';

import useAuth from '@/hooks/useAuth';
import LoggedInHome from '@/components/home/LoggedInHome';
import HeroSection from '@/components/home/HeroSection';
import StatsBar from '@/components/home/StatsBar';
import FeaturesSection from '@/components/home/FeaturesSection';
import ClassesSection from '@/components/home/ClassesSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import CtaBanner from '@/components/home/CtaBanner';

export default function HomePageClient() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <LoggedInHome user={user} />;
  }

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <ClassesSection />
      <HowItWorksSection />
      <CtaBanner />
    </div>
  );
}
