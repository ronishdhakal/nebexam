'use client';

import { useState } from 'react';
import EditProfileModal from './EditProfileModal';
import UpgradePlanModal from './UpgradePlanModal';
import { mediaUrl } from '@/lib/utils';

const TIER = {
  free:    { label: 'Free',     cls: 'bg-gray-100 text-slate-500' },
  '1month': { label: '1 Month', cls: 'bg-[#1CA3FD]/10 text-[#1CA3FD]' },
  '3month': { label: '3 Months',cls: 'bg-[#1CA3FD]/10 text-[#1CA3FD]' },
  '1year':  { label: '1 Year',  cls: 'bg-[#1CA3FD]/10 text-[#1CA3FD]' },
};

const TIER_DISPLAY = {
  free:    'Free',
  '1month': '1 Month',
  '3month': '3 Months',
  '1year':  '1 Year',
};

export default function ProfileBanner({ user }) {
  const [editing, setEditing]   = useState(false);
  const [upgrade, setUpgrade]   = useState(false);

  const picUrl   = mediaUrl(user.profile_picture);
  const initials = user.name?.[0]?.toUpperCase() ?? 'U';
  const tier     = TIER[user.subscription_tier] || TIER.free;
  const isFree   = (user.subscription_tier || 'free') === 'free';

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        {/* Blue top stripe */}
        <div className="h-24 bg-[#1CA3FD] relative">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar row — overlaps the stripe */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
            {/* Avatar */}
            <button
              onClick={() => setEditing(true)}
              className="relative group w-20 h-20 rounded-2xl ring-4 ring-white dark:ring-slate-800 shrink-0"
              title="Click to edit profile"
            >
              {picUrl ? (
                <img src={picUrl} alt={user.name} className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#1CA3FD]/15 flex items-center justify-center">
                  <span className="text-3xl font-black text-[#1CA3FD]">{initials}</span>
                </div>
              )}
              {/* Edit overlay */}
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2 pb-1">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 px-3.5 py-2 rounded-xl transition"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Profile
              </button>
              {isFree && (
                <button
                  onClick={() => setUpgrade(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1CA3FD] hover:bg-[#0e8fe0] px-3.5 py-2 rounded-xl transition shadow-sm shadow-[#1CA3FD]/20"
                >
                  Upgrade Plan →
                </button>
              )}
            </div>
          </div>

          {/* Name + meta */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{user.name}</h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${tier.cls}`}>
                {tier.label}
              </span>
              {user.level && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Class {user.level}
                </span>
              )}
              {user.stream && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                  user.stream === 'science'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                }`}>
                  {user.stream === 'science' ? 'Science' : 'Management'}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>

          {/* Info strip */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Phone</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.phone || '—'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Class</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.level ? `Class ${user.level}` : '—'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Stream</p>
              <p className={`text-sm font-bold ${
                user.stream === 'science' ? 'text-blue-600 dark:text-blue-400'
                  : user.stream === 'management' ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-800 dark:text-slate-100'
              }`}>
                {user.stream ? (user.stream === 'science' ? 'Science' : 'Management') : '—'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Subscription</p>
              <p className="text-sm font-bold text-slate-800">{TIER_DISPLAY[user.subscription_tier] || 'Free'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Member Since</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {new Date(user.date_joined).toLocaleDateString('en-NP', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Expiry warning */}
          {user.subscription_expires_at && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-[#1CA3FD]/5 border border-[#1CA3FD]/15 px-4 py-2.5 rounded-xl">
              <svg width="13" height="13" fill="none" stroke="#1CA3FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>
                Subscription expires on{' '}
                <strong className="text-slate-700">
                  {new Date(user.subscription_expires_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {editing && <EditProfileModal user={user} onClose={() => setEditing(false)} />}
      {upgrade  && <UpgradePlanModal currentTier={user.subscription_tier || 'free'} onClose={() => setUpgrade(false)} />}
    </>
  );
}
