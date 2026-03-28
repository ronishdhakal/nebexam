'use client';

import Link from 'next/link';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-xl p-10 max-w-md w-full text-center">

        {/* Failure icon */}
        <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          Payment Failed
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Your payment was not completed. You have not been charged.
          Please try again or contact us on WhatsApp if the issue persists.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full py-3 rounded-xl bg-[#1CA3FD] text-white text-sm font-bold hover:bg-[#0e8fe0] transition shadow-sm shadow-[#1CA3FD]/20"
          >
            Try Again
          </Link>
          <a
            href="https://wa.me/9779745450062"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            Contact Support on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
