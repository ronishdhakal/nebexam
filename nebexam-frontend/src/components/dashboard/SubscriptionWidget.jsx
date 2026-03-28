'use client';

import { useState } from 'react';
import UpgradePlanModal from './UpgradePlanModal';

const TIER_LABEL = {
  free:   'Free Plan',
  '1month': '1 Month Plan',
  '3month': '3 Month Plan',
  '1year':  '1 Year Plan',
};

function getDaysLeft(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function SubscriptionWidget({ user }) {
  const [showModal, setShowModal] = useState(false);
  const tier = user.subscription_tier || 'free';
  const isFree = tier === 'free';
  const label = TIER_LABEL[tier] || 'Free Plan';
  const daysLeft = getDaysLeft(user.subscription_expires_at);

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Subscription</p>
          <span className={`w-2 h-2 rounded-full ${isFree ? 'bg-gray-300' : 'bg-[#1CA3FD]'}`} />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1CA3FD]/8 flex items-center justify-center text-[#1CA3FD] shrink-0">
            {isFree ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{label}</p>
            {!isFree && daysLeft !== null ? (
              <p className={`text-xs font-semibold ${daysLeft <= 7 ? 'text-red-500' : daysLeft <= 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {daysLeft === 0 ? 'Expires today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
              </p>
            ) : (
              <p className="text-xs text-slate-400">{isFree ? 'Basic access included' : 'Active'}</p>
            )}
            {!isFree && user.subscription_expires_at && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                Expires{' '}
                {new Date(user.subscription_expires_at).toLocaleDateString('en-NP', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
            isFree
              ? 'bg-[#1CA3FD] text-white hover:bg-[#0e8fe0] shadow-sm shadow-[#1CA3FD]/20'
              : 'border border-[#1CA3FD]/30 text-[#1CA3FD] hover:bg-[#1CA3FD]/5'
          }`}
        >
          {isFree ? 'Upgrade Plan →' : 'View Plans'}
        </button>
      </div>

      {showModal && <UpgradePlanModal currentTier={tier} onClose={() => setShowModal(false)} />}
    </>
  );
}
