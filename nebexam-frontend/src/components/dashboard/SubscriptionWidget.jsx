'use client';

import { useState } from 'react';
import UpgradePlanModal from './UpgradePlanModal';

const TIER_CONFIG = {
  free:     { label: 'Free Plan',      icon: 'school',   badge: 'bg-slate-100 text-slate-600',        bar: 'bg-slate-300' },
  '1month': { label: '1 Month Plan',   icon: 'zap',      badge: 'bg-blue-50 text-blue-600',           bar: 'bg-blue-400' },
  '3month': { label: '3 Month Plan',   icon: 'zap',      badge: 'bg-[#1CA3FD]/10 text-[#1CA3FD]',    bar: 'bg-[#1CA3FD]' },
  '1year':  { label: '1 Year Plan',    icon: 'zap',      badge: 'bg-violet-50 text-violet-600',       bar: 'bg-violet-500' },
};

const TOTAL_DAYS = { '1month': 30, '3month': 90, '1year': 365 };

function getDaysLeft(expiresAt) {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / 86400000));
}

function ZapIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

function SchoolIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}

export default function SubscriptionWidget({ user }) {
  const [showModal, setShowModal] = useState(false);

  const tier     = user.subscription_tier || 'free';
  const daysLeft = getDaysLeft(user.subscription_expires_at);
  // Treat as free if tier is paid but subscription has expired (daysLeft === 0)
  const isExpired = tier !== 'free' && daysLeft !== null && daysLeft === 0;
  const isFree   = tier === 'free' || isExpired;
  const config   = isFree ? TIER_CONFIG.free : (TIER_CONFIG[tier] ?? TIER_CONFIG.free);
  const total    = TOTAL_DAYS[tier] ?? null;
  const progress = (!isFree && daysLeft !== null && total)
    ? Math.round((daysLeft / total) * 100)
    : null;

  const expiryColor =
    daysLeft === null   ? '' :
    daysLeft <= 7       ? 'text-red-500' :
    daysLeft <= 30      ? 'text-amber-500' :
                          'text-emerald-600';

  const progressColor =
    daysLeft === null   ? config.bar :
    daysLeft <= 7       ? 'bg-red-400' :
    daysLeft <= 30      ? 'bg-amber-400' :
                          config.bar;

  return (
    <>
      <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-col shadow-sm p-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold text-slate-400 dark:text-muted uppercase tracking-widest">Subscription</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${config.badge}`}>
            {config.label}
          </span>
        </div>

        {/* Status */}
        {!isFree && daysLeft !== null ? (
          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <p className={`text-2xl font-extrabold tabular-nums leading-none ${expiryColor}`}>
                {daysLeft}
                <span className="text-sm font-semibold ml-0.5">d</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-muted font-medium">remaining</p>
            </div>

            {/* Progress bar */}
            {progress !== null && (
              <div className="w-full bg-gray-100 dark:bg-surface-2 rounded-full h-1.5 mb-2">
                <div
                  className={`h-1.5 rounded-full transition-all ${progressColor}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}

            <p className="text-[11px] text-slate-400 dark:text-muted">
              Expires {new Date(user.subscription_expires_at).toLocaleDateString('en-NP', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${config.badge}`}>
              {isFree ? <SchoolIcon /> : <ZapIcon />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-foreground">Free access</p>
              <p className="text-xs text-slate-400 dark:text-muted">Upgrade for full content</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
            isFree
              ? 'bg-[#1CA3FD] text-white hover:bg-[#0e8fe0] shadow-sm shadow-[#1CA3FD]/20'
              : 'border border-[#1CA3FD]/25 text-[#1CA3FD] hover:bg-[#1CA3FD]/5'
          }`}
        >
          {isFree ? 'Upgrade Plan →' : 'View All Plans'}
        </button>
      </div>

      {showModal && <UpgradePlanModal currentTier={tier} onClose={() => setShowModal(false)} />}
    </>
  );
}
