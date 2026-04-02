'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { referralService } from '@/services/users.service';

const TIER_LABEL = { '1month': '1 Month', '3month': '3 Months', '1year': '1 Year' };

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button onClick={handle} title="Copy" className="ml-1.5 text-slate-400 hover:text-violet-600 transition">
      {copied ? (
        <svg width="12" height="12" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )}
    </button>
  );
}

// ── Referral tracking tab ──────────────────────────────────────────────────────

function ReferralTab() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(null);
  const [clearing, setClearing] = useState(null);
  const [cleared, setCleared]   = useState(null);

  useEffect(() => {
    referralService.getAdminStats()
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const handleClearBalance = async (referrerId) => {
    setClearing(referrerId);
    try {
      await referralService.clearBalance(referrerId);
      setData((prev) => prev.map((r) => r.referrer_id === referrerId ? { ...r, referral_balance: 0 } : r));
      setCleared(referrerId);
      setTimeout(() => setCleared(null), 3000);
    } catch { /* silent */ } finally {
      setClearing(null);
    }
  };

  const filtered = (data ?? []).filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.referrer_name?.toLowerCase().includes(q) ||
      r.referrer_email?.toLowerCase().includes(q) ||
      r.referrer_phone?.toLowerCase().includes(q) ||
      r.referral_code?.toLowerCase().includes(q)
    );
  });

  const totalUses    = (data ?? []).reduce((s, r) => s + r.total_uses, 0);
  const totalRewards = (data ?? []).reduce((s, r) => s + (r.total_reward ?? 0), 0);
  const totalBalance = (data ?? []).reduce((s, r) => s + (r.referral_balance ?? 0), 0);

  return (
    <div>
      {!loading && data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Referrers',     value: data.length },
            { label: 'Total Code Uses',      value: totalUses },
            { label: 'Total Rewards Issued', value: `Rs. ${totalRewards.toFixed(0)}` },
            { label: 'Total Balance Held',   value: `Rs. ${totalBalance.toFixed(0)}` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone, code…"
          className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            {search ? 'No results match your search.' : 'No referral activity yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Referrer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Code</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Uses</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Rewards Earned</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Balance</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((referrer, i) => (
                  <React.Fragment key={referrer.referrer_id}>
                    <tr className={`hover:bg-slate-50 transition-colors ${expanded === i ? 'bg-violet-50/40' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-violet-700">
                              {referrer.referrer_name?.[0]?.toUpperCase() ?? '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{referrer.referrer_name}</p>
                            <p className="text-xs text-slate-400">{referrer.referrer_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-sm">{referrer.referrer_phone || '—'}</td>
                      <td className="px-5 py-3.5">
                        <div className="inline-flex items-center">
                          <span className="font-mono font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-lg text-xs tracking-widest">
                            {referrer.referral_code}
                          </span>
                          <CopyButton text={referrer.referral_code} />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                          {referrer.total_uses}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-700">
                        Rs. {(referrer.total_reward ?? 0).toFixed(0)}
                      </td>
                      <td className="px-5 py-3.5">
                        {cleared === referrer.referrer_id ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            Paid
                          </span>
                        ) : (referrer.referral_balance ?? 0) > 0 ? (
                          <span className="font-semibold text-amber-600">Rs. {(referrer.referral_balance).toFixed(0)}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">Rs. 0</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {referrer.total_uses > 0 && (
                            <button
                              onClick={() => setExpanded(expanded === i ? null : i)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1CA3FD] hover:text-[#0e8fe0] transition"
                            >
                              {expanded === i ? 'Hide' : 'View'} ({referrer.total_uses})
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={`transition-transform ${expanded === i ? 'rotate-180' : ''}`}>
                                <polyline points="6 9 12 15 18 9"/>
                              </svg>
                            </button>
                          )}
                          {(referrer.referral_balance ?? 0) > 0 && cleared !== referrer.referrer_id && (
                            <button
                              onClick={() => handleClearBalance(referrer.referrer_id)}
                              disabled={clearing === referrer.referrer_id}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition disabled:opacity-50"
                            >
                              {clearing === referrer.referrer_id ? 'Clearing…' : 'Mark Paid'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {expanded === i && referrer.usages.length > 0 && (
                      <tr>
                        <td colSpan={7} className="px-0 py-0">
                          <div className="bg-slate-50 border-t border-b border-violet-100">
                            <div className="px-5 py-2 text-[10px] font-bold text-violet-500 uppercase tracking-widest">
                              Students who used code {referrer.referral_code}
                            </div>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-y border-violet-100/60 bg-violet-50/50">
                                  <th className="text-left px-5 py-2 text-slate-400 font-semibold uppercase tracking-wide">Student</th>
                                  <th className="text-left px-5 py-2 text-slate-400 font-semibold uppercase tracking-wide">Phone</th>
                                  <th className="text-left px-5 py-2 text-slate-400 font-semibold uppercase tracking-wide">Plan</th>
                                  <th className="text-left px-5 py-2 text-slate-400 font-semibold uppercase tracking-wide">Amount Paid</th>
                                  <th className="text-left px-5 py-2 text-slate-400 font-semibold uppercase tracking-wide">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-violet-50">
                                {referrer.usages.map((u, j) => (
                                  <tr key={j} className="hover:bg-white transition-colors">
                                    <td className="px-5 py-2.5">
                                      <p className="font-semibold text-slate-800">{u.user_name}</p>
                                      <p className="text-slate-400">{u.user_email}</p>
                                    </td>
                                    <td className="px-5 py-2.5 text-slate-500">{u.user_phone || '—'}</td>
                                    <td className="px-5 py-2.5 text-slate-600 font-medium">{TIER_LABEL[u.tier] || u.tier}</td>
                                    <td className="px-5 py-2.5 font-bold text-slate-800">Rs. {u.amount}</td>
                                    <td className="px-5 py-2.5 text-slate-400">
                                      {u.paid_at ? new Date(u.paid_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Payout requests tab ────────────────────────────────────────────────────────

const STATUS_BADGE = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
};

function NoteModal({ request, onClose, onSave }) {
  const [note, setNote]       = useState(request.admin_note || '');
  const [action, setAction]   = useState('approved');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await referralService.actionPayoutRequest(request.id, { status: action, admin_note: note });
      onSave(request.id, action, note);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Process Payout Request</h3>
            <p className="text-xs text-slate-400 mt-0.5">{request.user_name} · Rs. {Number(request.amount).toFixed(0)} via {request.payment_method}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Payment detail box */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Send payment to</p>
          <p className="text-sm font-bold text-slate-800">{request.payment_method}</p>
          <p className="text-sm text-slate-600 font-mono">{request.payment_detail}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAction('approved')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${
                action === 'approved'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
              }`}
            >
              Approve &amp; Mark Paid
            </button>
            <button
              type="button"
              onClick={() => setAction('rejected')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${
                action === 'rejected'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-red-300'
              }`}
            >
              Reject
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Note to student (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={action === 'rejected' ? 'Reason for rejection…' : 'e.g. Payment sent ✓'}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition disabled:opacity-60 ${
                action === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {loading ? 'Saving…' : action === 'approved' ? 'Confirm Payment' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PayoutRequestsTab() {
  const [requests, setRequests]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('pending');
  const [modal, setModal]         = useState(null);   // request being actioned

  const load = useCallback(() => {
    setLoading(true);
    referralService.getPayoutRequests(filter)
      .then((res) => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleSave = (id, newStatus, adminNote) => {
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: newStatus, admin_note: adminNote } : r)
    );
    setModal(null);
  };

  const pendingCount = (requests ?? []).filter((r) => r.status === 'pending').length;

  return (
    <div>
      {modal && (
        <NoteModal
          request={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition border ${
              filter === s
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No payout requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Student</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Send To</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Requested</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{req.user_name}</p>
                      <p className="text-xs text-slate-400">{req.user_email}</p>
                      {req.user_phone && <p className="text-xs text-slate-400">{req.user_phone}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-base font-extrabold text-emerald-700">Rs. {Number(req.amount).toFixed(0)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-slate-700">{req.payment_method}</p>
                      <p className="text-xs font-mono text-slate-500">{req.payment_detail}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[req.status] || ''}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                      {req.admin_note && (
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[160px] truncate" title={req.admin_note}>{req.admin_note}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {req.status === 'pending' ? (
                        <button
                          onClick={() => setModal(req)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1CA3FD]/10 hover:bg-[#1CA3FD]/20 text-[#1CA3FD] border border-[#1CA3FD]/20 transition"
                        >
                          Process
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                          </svg>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {req.paid_at ? new Date(req.paid_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short' }) : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ReferralPage() {
  const [tab, setTab] = useState('referrals');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Referral &amp; Payouts</h1>
        <p className="text-sm text-slate-500">Track referral codes, usage, earned rewards, and payout requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-100">
        {[
          { key: 'referrals', label: 'Referral Tracking' },
          { key: 'payouts',   label: 'Payout Requests' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.key
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'referrals' ? <ReferralTab /> : <PayoutRequestsTab />}
    </div>
  );
}
