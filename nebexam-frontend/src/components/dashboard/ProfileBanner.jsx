'use client';

import { useState } from 'react';
import EditProfileModal from './EditProfileModal';
import UpgradePlanModal from './UpgradePlanModal';
import { mediaUrl } from '@/lib/utils';

const TIER_CONFIG = {
  free:     { label: 'Free',     badge: 'bg-slate-100 text-slate-500',         dot: 'bg-slate-400' },
  '1month': { label: '1 Month',  badge: 'bg-blue-50 text-blue-600',            dot: 'bg-blue-500' },
  '3month': { label: '3 Months', badge: 'bg-[#1CA3FD]/10 text-[#1CA3FD]',     dot: 'bg-[#1CA3FD]' },
  '1year':  { label: '1 Year',   badge: 'bg-violet-50 text-violet-600',        dot: 'bg-violet-500' },
};

function getDaysLeft(expiresAt) {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / 86400000));
}

export default function ProfileBanner({ user }) {
  const [editing, setEditing] = useState(false);
  const [upgrade, setUpgrade] = useState(false);

  const picUrl   = mediaUrl(user.profile_picture);
  const initials = user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';
  const tier     = TIER_CONFIG[user.subscription_tier] ?? TIER_CONFIG.free;
  const isFree   = (user.subscription_tier || 'free') === 'free';
  const daysLeft = getDaysLeft(user.subscription_expires_at);

  const expiryColor =
    daysLeft === null   ? 'text-slate-500' :
    daysLeft <= 7       ? 'text-red-500' :
    daysLeft <= 30      ? 'text-amber-500' :
                          'text-emerald-600';

  return (
    <>
      <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-col shadow-sm overflow-hidden">

        {/* Top accent */}
        <div className="h-[3px] bg-gradient-to-r from-[#1CA3FD] via-[#1CA3FD]/50 to-transparent" />

        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">

          {/* ── Avatar ── */}
          <button
            onClick={() => setEditing(true)}
            title="Edit profile"
            className="relative group w-16 h-16 rounded-2xl shrink-0 self-start sm:self-center"
          >
            {picUrl ? (
              <img src={picUrl} alt={user.name} className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#1CA3FD]/10 flex items-center justify-center">
                <span className="text-xl font-black text-[#1CA3FD]">{initials}</span>
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
          </button>

          {/* ── Name + badges ── */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-foreground leading-tight truncate">{user.name}</h2>
            <p className="text-sm text-slate-400 dark:text-muted mb-2.5 truncate">{user.email}</p>

            <div className="flex flex-wrap gap-1.5">
              {/* Plan badge */}
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg ${tier.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tier.dot}`} />
                {tier.label} Plan
              </span>

              {/* Class */}
              {user.level && (
                <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-surface-2 text-slate-600 dark:text-muted">
                  Class {user.level}
                </span>
              )}

              {/* Stream */}
              {user.stream && (
                <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                  user.stream === 'science'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {user.stream === 'science' ? 'Science' : 'Management'}
                </span>
              )}

              {/* Phone */}
              {user.phone && (
                <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-surface-2 text-slate-400 dark:text-muted border border-gray-100 dark:border-border-col">
                  {user.phone}
                </span>
              )}
            </div>
          </div>

          {/* ── Right: expiry + actions ── */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-3 shrink-0">

            {/* Subscription status */}
            {!isFree && daysLeft !== null ? (
              <div className="text-left sm:text-right">
                <p className={`text-sm font-extrabold tabular-nums leading-tight ${expiryColor}`}>
                  {daysLeft === 0 ? 'Expires today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-muted mt-0.5">
                  Expires {new Date(user.subscription_expires_at).toLocaleDateString('en-NP', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 dark:text-muted font-medium hidden sm:block text-right">
                Member since{' '}
                {new Date(user.date_joined).toLocaleDateString('en-NP', { month: 'short', year: 'numeric' })}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-semibold text-slate-500 dark:text-muted hover:text-slate-800 dark:hover:text-foreground border border-gray-200 dark:border-border-col hover:border-gray-300 bg-white dark:bg-surface hover:bg-gray-50 dark:hover:bg-surface-2 px-3 py-1.5 rounded-xl transition"
              >
                Edit
              </button>
              {isFree ? (
                <button
                  onClick={() => setUpgrade(true)}
                  className="text-xs font-bold text-white bg-[#1CA3FD] hover:bg-[#0e8fe0] px-3.5 py-1.5 rounded-xl transition shadow-sm shadow-[#1CA3FD]/25"
                >
                  Upgrade →
                </button>
              ) : (
                <button
                  onClick={() => setUpgrade(true)}
                  className="text-xs font-semibold text-[#1CA3FD] border border-[#1CA3FD]/30 hover:bg-[#1CA3FD]/5 px-3 py-1.5 rounded-xl transition"
                >
                  Plans
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {editing && <EditProfileModal user={user} onClose={() => setEditing(false)} />}
      {upgrade  && <UpgradePlanModal currentTier={user.subscription_tier || 'free'} onClose={() => setUpgrade(false)} />}
    </>
  );
}
