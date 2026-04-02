'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { subjectsService } from '@/services/subjects.service';
import { entriesService } from '@/services/questionbank.service';
import { chaptersService } from '@/services/chapters.service';
import ProfileBanner from '@/components/dashboard/ProfileBanner';
import StatsGrid from '@/components/dashboard/StatsGrid';
import SubjectsList from '@/components/dashboard/SubjectsList';
import SubscriptionWidget from '@/components/dashboard/SubscriptionWidget';
import QuickBrowse from '@/components/dashboard/QuickBrowse';
import ClassStreamCard from '@/components/dashboard/ClassStreamCard';
import StudyAnalytics from '@/components/dashboard/StudyAnalytics';
import ReferralCard from '@/components/dashboard/ReferralCard';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats]       = useState(null);

  /* Auth guard */
  useEffect(() => {
    if (isAuthenticated === false) { router.push('/auth/login'); return; }
    if (user?.is_staff) router.push('/admin');
  }, [isAuthenticated, user, router]);

  /* Data fetch */
  useEffect(() => {
    if (!user || user.is_staff) return;
    const p = {};
    if (user.level)  p.class_level = user.level;
    if (user.stream) p.stream = user.stream;
    Promise.all([
      subjectsService.getAll(p),
      entriesService.getAll(p),
      chaptersService.getAll(p),
    ]).then(([sRes, eRes, cRes]) => {
      const sl = sRes.data.results ?? sRes.data;
      const el = eRes.data.results ?? eRes.data;
      const cl = cRes.data.results ?? cRes.data;
      setSubjects(Array.isArray(sl) ? sl : []);
      setStats({
        subjects: Array.isArray(sl) ? sl.length : 0,
        entries:  Array.isArray(el) ? el.length : 0,
        chapters: Array.isArray(cl) ? cl.length : 0,
      });
    }).catch(() => {});
  }, [user]);

  /* Loading */
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1CA3FD] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-5">

        {/* ── Greeting ── */}
        <div>
          <p className="text-xs font-bold text-[#1CA3FD] uppercase tracking-widest mb-0.5">Student Dashboard</p>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-foreground">
            {greeting}, {user.name?.split(' ')[0]}
          </h1>
        </div>

        {/* ── Profile ── */}
        <ProfileBanner user={user} />

        {/* ── Stats ── */}
        <StatsGrid stats={stats} user={user} />

        {/* ── Main content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* Left col — 2/3 */}
          <div className="lg:col-span-2 space-y-5">
            <SubjectsList subjects={subjects} level={user.level} />
            <StudyAnalytics />
            <QuickBrowse currentLevel={user.level} />
          </div>

          {/* Right sidebar — 1/3 */}
          <div className="space-y-4">
            <SubscriptionWidget user={user} />
            <ClassStreamCard user={user} />
            <ReferralCard />
          </div>

        </div>
      </div>
    </div>
  );
}
