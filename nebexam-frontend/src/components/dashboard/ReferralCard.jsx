'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { referralService } from '@/services/users.service';
import useConfigStore from '@/store/configStore';

const TIER_LABEL = { '1month': '1 Month', '3month': '3 Months', '1year': '1 Year' };
const PAYOUT_MIN = 100;

function PayoutModal({ balance, onClose, onSuccess }) {
  const [method, setMethod]   = useState('eSewa');
  const [detail, setDetail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!detail.trim()) { setError('Please enter your payment detail.'); return; }
    setLoading(true);
    setError('');
    try {
      await referralService.requestPayout({ payment_method: method, payment_detail: detail.trim() });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-foreground">Request Payout</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="bg-emerald-50 rounded-xl px-4 py-3 mb-5 text-center">
          <p className="text-xs text-emerald-600 font-medium mb-0.5">Amount to withdraw</p>
          <p className="text-2xl font-extrabold text-emerald-700">Rs. {balance.toFixed(0)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-muted mb-1.5">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border border-slate-200 dark:border-border-col rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-foreground bg-white dark:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-muted mb-1.5">
              {method === 'Bank Transfer' ? 'Account Number / Bank Name' : `${method} Number`}
            </label>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={method === 'Bank Transfer' ? 'e.g. 01234567890 — Nepal Bank' : 'e.g. 98XXXXXXXX'}
              className="w-full border border-slate-200 dark:border-border-col rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-foreground bg-white dark:bg-surface-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition disabled:opacity-60"
            >
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_CONFIG = {
  pending:  { label: 'Payout Requested',  bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  approved: { label: 'Payout Approved',   bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: 'Payout Rejected',   bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400' },
};

export default function ReferralCard() {
  const esewaEnabled = useConfigStore((s) => s.esewaEnabled);
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [copied, setCopied]     = useState(false);
  const [open, setOpen]         = useState(false);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    referralService.getMyStats()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCopy = () => {
    if (!data?.referral_code) return;
    navigator.clipboard.writeText(data.referral_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!esewaEnabled) return null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-col shadow-sm p-5 animate-pulse">
        <div className="h-4 w-32 bg-slate-100 dark:bg-surface-2 rounded mb-3" />
        <div className="h-10 w-full bg-slate-100 dark:bg-surface-2 rounded-xl mb-3" />
        <div className="h-3 w-48 bg-slate-100 dark:bg-surface-2 rounded" />
      </div>
    );
  }

  if (!data) return null;

  const { referral_code, referral_balance, pending_balance, total_uses, usages, my_referral_used, payout_request } = data;
  const balance = Number(referral_balance);
  const canRequestPayout = balance >= PAYOUT_MIN && (!payout_request || payout_request.status !== 'pending');
  const payoutStatus = payout_request ? STATUS_CONFIG[payout_request.status] : null;

  return (
    <>
      {showModal && (
        <PayoutModal
          balance={balance}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); load(); }}
        />
      )}

      <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-col shadow-sm p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-foreground">Refer &amp; Earn</h3>
          </div>
          <Link
            href="/referral-program"
            className="text-[10px] font-semibold text-violet-500 hover:text-violet-700 transition"
          >
            Learn more →
          </Link>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-muted mb-3 leading-relaxed">
          Share your code. When a friend pays using it, they get{' '}
          <span className="font-semibold text-slate-700 dark:text-foreground">10% off</span> and you earn{' '}
          <span className="font-semibold text-violet-600">10% credit</span>{' '}
          (on payments ≥ Rs. 100).
        </p>

        {/* Code box */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-2.5 font-mono text-base font-bold tracking-widest text-violet-700 dark:text-violet-300 text-center select-all">
            {referral_code}
          </div>
          <button
            onClick={handleCopy}
            title="Copy code"
            className="shrink-0 w-9 h-9 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-700 flex items-center justify-center transition"
          >
            {copied ? (
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-50 dark:bg-surface-2 rounded-xl p-2.5 text-center">
            <p className="text-lg font-extrabold text-slate-800 dark:text-foreground">{total_uses}</p>
            <p className="text-[10px] text-slate-500 dark:text-muted font-medium leading-tight mt-0.5">Times Used</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-extrabold text-emerald-700">Rs. {balance.toFixed(0)}</p>
            <p className="text-[10px] text-emerald-600 font-medium leading-tight mt-0.5">Earned</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-extrabold text-amber-700">Rs. {Number(pending_balance).toFixed(0)}</p>
            <p className="text-[10px] text-amber-600 font-medium leading-tight mt-0.5">Pending</p>
          </div>
        </div>

        {/* Payout request status or button */}
        {payoutStatus ? (
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3 ${payoutStatus.bg}`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${payoutStatus.dot}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${payoutStatus.text}`}>{payoutStatus.label}</p>
              {payout_request.status === 'pending' && (
                <p className="text-[10px] text-slate-400 mt-0.5">Rs. {Number(payout_request.amount).toFixed(0)} via {payout_request.payment_method} · under review</p>
              )}
              {payout_request.status === 'approved' && (
                <p className="text-[10px] text-slate-400 mt-0.5">Rs. {Number(payout_request.amount).toFixed(0)} via {payout_request.payment_method} · paid</p>
              )}
              {payout_request.status === 'rejected' && payout_request.admin_note && (
                <p className="text-[10px] text-slate-400 mt-0.5">{payout_request.admin_note}</p>
              )}
            </div>
          </div>
        ) : balance >= PAYOUT_MIN ? (
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition mb-3"
          >
            Request Payout · Rs. {balance.toFixed(0)}
          </button>
        ) : balance > 0 ? (
          <div className="rounded-xl bg-slate-50 dark:bg-surface-2 px-3 py-2 mb-3 text-center">
            <p className="text-[10px] text-slate-400 dark:text-muted">
              Earn <span className="font-semibold text-slate-600 dark:text-foreground">Rs. {(PAYOUT_MIN - balance).toFixed(0)}</span> more to request a payout
            </p>
            <div className="mt-1.5 h-1.5 bg-slate-200 dark:bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min((balance / PAYOUT_MIN) * 100, 100)}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Usage list toggle */}
        {total_uses > 0 && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full text-xs font-semibold text-slate-500 dark:text-muted hover:text-violet-600 flex items-center justify-between transition mb-1"
          >
            <span>Who used my code ({total_uses})</span>
            <svg
              width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        )}

        {open && usages.length > 0 && (
          <div className="mt-2 space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {usages.map((u, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-surface-2 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-foreground truncate max-w-[120px]">{u.user_name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-muted">{TIER_LABEL[u.tier] || u.tier} · Rs. {u.amount}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-emerald-600">+Rs. {Number(u.reward_amount).toFixed(0)}</p>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                    u.reward_status === 'released'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {u.reward_status === 'released' ? 'Released' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Did I use someone else's code? */}
        {my_referral_used && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-border-col">
            <p className="text-[10px] text-slate-400 dark:text-muted mb-1 font-medium uppercase tracking-wide">You used a referral code</p>
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 rounded-xl px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">{my_referral_used.referrer_name}</p>
                <p className="text-[10px] text-blue-500 dark:text-blue-400 font-mono">{my_referral_used.referrer_code}</p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{TIER_LABEL[my_referral_used.tier] || my_referral_used.tier}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
