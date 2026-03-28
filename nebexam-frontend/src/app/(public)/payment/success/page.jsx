'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/users.service';
import useAuthStore from '@/store/authStore';

const PLAN_LABELS = {
  '1month': '1 Month',
  '3month': '3 Months',
  '1year':  '1 Year',
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { setUser }  = useAuthStore();
  const tier         = searchParams.get('tier');
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    // Refresh user profile so subscription info updates immediately
    authService.getProfile()
      .then((res) => { setUser(res.data); setRefreshed(true); })
      .catch(() => setRefreshed(true));
  }, [setUser]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-xl p-10 max-w-md w-full text-center">

        {/* Success icon */}
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
          Your <span className="font-semibold text-slate-700 dark:text-slate-200">
            {PLAN_LABELS[tier] ?? tier}
          </span> subscription is now active.
        </p>
        <p className="text-xs text-slate-400 mb-8">
          Full access to all notes, PDFs, and past papers has been unlocked.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full py-3 rounded-xl bg-[#1CA3FD] text-white text-sm font-bold hover:bg-[#0e8fe0] transition shadow-sm shadow-[#1CA3FD]/20"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            Browse Subjects
          </Link>
        </div>
      </div>
    </div>
  );
}
