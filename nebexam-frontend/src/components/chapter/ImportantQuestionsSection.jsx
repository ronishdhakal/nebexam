'use client';

import Link from 'next/link';
import QuestionTree from '@/components/question/QuestionTree';
import useAuthStore from '@/store/authStore';

const FREE_PREVIEW_COUNT = 4;

export default function ImportantQuestionsSection({ questions }) {
  const { user } = useAuthStore();
  const isFree = !user?.subscription_tier || user.subscription_tier === 'free';

  if (!questions?.length) return null;

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Important Questions</h2>
      {isFree && questions.length > FREE_PREVIEW_COUNT ? (
        <div>
          <QuestionTree questions={questions.slice(0, FREE_PREVIEW_COUNT)} hideMeta />
          <div className="relative mt-2">
            <div className="pointer-events-none select-none blur-sm opacity-40">
              <QuestionTree questions={questions.slice(FREE_PREVIEW_COUNT, FREE_PREVIEW_COUNT + 2)} hideMeta />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-white/80 to-white dark:via-slate-900/80 dark:to-slate-900 rounded-xl">
              <div className="flex flex-col items-center gap-3 py-6 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1CA3FD]/10 flex items-center justify-center">
                  <svg width="22" height="22" fill="none" stroke="#1CA3FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {questions.length - FREE_PREVIEW_COUNT} more question{questions.length - FREE_PREVIEW_COUNT !== 1 ? 's' : ''} locked
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Upgrade to a paid plan to view all important questions</p>
                </div>
                <Link
                  href="/subscription"
                  className="mt-1 inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#1CA3FD]/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-[#1CA3FD]/30"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Upgrade to View All
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <QuestionTree questions={questions} hideMeta />
      )}
    </div>
  );
}
