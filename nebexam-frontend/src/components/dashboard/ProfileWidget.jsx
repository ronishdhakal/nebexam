'use client';

import { useState } from 'react';
import EditProfileModal from './EditProfileModal';
import { mediaUrl } from '@/lib/utils';

const TIER_LABELS = {
  free:    'Free',
  '1month': '1 Month',
  '3month': '3 Months',
  '1year':  '1 Year',
};

export default function ProfileWidget({ user }) {
  const [editing, setEditing] = useState(false);
  const picUrl = mediaUrl(user.profile_picture);
  const initials = user.name?.[0]?.toUpperCase() ?? 'U';
  const tierLabel = TIER_LABELS[user.subscription_tier] || 'Free';

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Top bar */}
        <div className="h-1 bg-[#1CA3FD]" />

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">My Profile</p>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1CA3FD] hover:text-[#0e8fe0] transition"
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>

          {/* Avatar + name */}
          <div className="flex items-center gap-3.5 mb-5">
            {picUrl ? (
              <img src={picUrl} alt={user.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#1CA3FD]/15 shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#1CA3FD]/10 flex items-center justify-center shrink-0 ring-2 ring-[#1CA3FD]/10">
                <span className="text-xl font-extrabold text-[#1CA3FD]">{initials}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-0 divide-y divide-gray-50">
            <div className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-slate-400">Class</span>
              <span className="font-semibold text-slate-900">
                {user.level ? `Class ${user.level}` : <span className="text-slate-300">Not set</span>}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-slate-400">Phone</span>
              <span className="font-semibold text-slate-900">
                {user.phone || <span className="text-slate-300">Not set</span>}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-slate-400">Plan</span>
              <span className="font-bold text-[10px] px-2 py-0.5 rounded-lg bg-[#1CA3FD]/8 text-[#1CA3FD]">
                {tierLabel}
              </span>
            </div>
            {user.subscription_expires_at && (
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-slate-400">Expires</span>
                <span className="font-semibold text-slate-900">
                  {new Date(user.subscription_expires_at).toLocaleDateString('en-NP', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-slate-400">Member since</span>
              <span className="font-semibold text-slate-900">
                {new Date(user.date_joined).toLocaleDateString('en-NP', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {editing && <EditProfileModal user={user} onClose={() => setEditing(false)} />}
    </>
  );
}
