'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import useConfigStore from '@/store/configStore';
import { referralService } from '@/services/users.service';

function Step({ number, title, desc, accent }) {
  return (
    <div className="flex gap-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${accent}`}>
        {number}
      </div>
      <div className="pt-1">
        <p className="text-sm font-bold text-slate-800 dark:text-foreground mb-0.5">{title}</p>
        <p className="text-xs text-slate-500 dark:text-muted leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function ReferralProgramPageClient() {
  const { user, isAuthenticated } = useAuth();
  const esewaEnabled = useConfigStore((s) => s.esewaEnabled);

  const [copied, setCopied]     = useState(false);
  const [stats, setStats]       = useState(null);

  useEffect(() => {
    if (isAuthenticated && esewaEnabled) {
      referralService.getMyStats()
        .then((res) => setStats(res.data))
        .catch(() => {});
    }
  }, [isAuthenticated, esewaEnabled]);

  const referralCode = stats?.referral_code ?? user?.referral_code ?? null;

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">

      {/* ── Hero ── */}
      <div className="bg-white dark:bg-surface border-b border-gray-100 dark:border-border-col">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-950/40 mb-5">
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-violet-600">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-foreground mb-3">
            Refer Friends, Earn Together
          </h1>
          <p className="text-base text-slate-500 dark:text-muted max-w-xl mx-auto leading-relaxed">
            Share your unique code with a friend. When they subscribe using your code,{' '}
            <span className="font-semibold text-slate-700 dark:text-foreground">they save 10%</span> on their plan
            and you earn a{' '}
            <span className="font-semibold text-violet-600">10% commission</span> — it&apos;s a win for everyone.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 space-y-8">

        {/* ── Your Referral Code (shown only if esewa enabled & logged in) ── */}
        {esewaEnabled && isAuthenticated && referralCode && (
          <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-col shadow-sm p-6">
            <p className="text-xs font-semibold text-slate-400 dark:text-muted uppercase tracking-widest mb-3">Your Referral Code</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl px-5 py-3 font-mono text-xl font-black tracking-[0.25em] text-violet-700 dark:text-violet-300 text-center select-all">
                {referralCode}
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition"
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-muted mt-3 text-center">
              Share this code with your friends and classmates
            </p>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-slate-50 dark:bg-surface-2 rounded-xl p-3 text-center">
                  <p className="text-xl font-extrabold text-slate-800 dark:text-foreground">{stats.total_uses}</p>
                  <p className="text-[10px] text-slate-500 dark:text-muted font-medium mt-0.5">Friends Referred</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 text-center">
                  <p className="text-xl font-extrabold text-emerald-700">Rs. {Number(stats.referral_balance).toFixed(0)}</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Earned</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 text-center">
                  <p className="text-xl font-extrabold text-amber-700">Rs. {Number(stats.pending_balance).toFixed(0)}</p>
                  <p className="text-[10px] text-amber-600 font-medium mt-0.5">Pending</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Not logged in CTA ── */}
        {esewaEnabled && !isAuthenticated && (
          <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900 rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-foreground mb-3">
              Log in to see your unique referral code and start earning
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              Log In to Get Your Code
            </Link>
          </div>
        )}

        {/* ── How it works ── */}
        <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-col shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 dark:text-foreground mb-5">How It Works</h2>
          <div className="space-y-5">
            <Step
              number="1"
              accent="bg-violet-100 text-violet-700"
              title="Share Your Code"
              desc="Copy your unique referral code and share it with your friends, classmates, or on social media."
            />
            <Step
              number="2"
              accent="bg-blue-100 text-blue-700"
              title="Friend Subscribes with Your Code"
              desc="When your friend enters your code at checkout, they instantly get 10% off their subscription plan."
            />
            <Step
              number="3"
              accent="bg-emerald-100 text-emerald-700"
              title="You Earn a Commission"
              desc="Once their payment is confirmed, you automatically earn a 10% commission credited to your account."
            />
          </div>
        </div>

        {/* ── Benefits cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-col shadow-sm p-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-blue-600">
                <path d="M20 12V22H4V12"/>
                <path d="M22 7H2v5h20V7z"/>
                <path d="M12 22V7"/>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-foreground mb-1">Your Friend Saves</h3>
            <p className="text-xs text-slate-500 dark:text-muted leading-relaxed">
              Your friend gets an instant <span className="font-semibold text-slate-700 dark:text-foreground">10% discount</span> on any subscription plan they choose — a great reason for them to join.
            </p>
          </div>
          <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-col shadow-sm p-5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-violet-600">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-foreground mb-1">You Earn Commission</h3>
            <p className="text-xs text-slate-500 dark:text-muted leading-relaxed">
              You earn a <span className="font-semibold text-violet-600">10% commission</span> on every successful referral — with no cap on how many friends you can refer.
            </p>
          </div>
        </div>

        {/* ── Terms ── */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-amber-600 shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">Program Conditions</h3>
          </div>
          <ul className="space-y-2 text-xs text-amber-700 dark:text-amber-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">•</span>
              <span>Your friend must complete a payment of at least <strong>Rs. 100</strong> for your commission to be credited.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">•</span>
              <span>The referral code must be applied at checkout before payment is made — it cannot be applied retroactively.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">•</span>
              <span>Commission is credited to your account balance automatically once the payment is verified.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">•</span>
              <span>NEB Exam reserves the right to modify or discontinue the referral program at any time.</span>
            </li>
          </ul>
        </div>

        {/* ── Dashboard CTA ── */}
        {isAuthenticated && (
          <div className="text-center py-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1CA3FD] hover:text-[#0e8fe0] transition"
            >
              View your full referral stats in the dashboard
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
