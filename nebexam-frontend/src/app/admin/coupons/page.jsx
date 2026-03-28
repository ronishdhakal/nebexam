'use client';

import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '@/services/users.service';
import { getErrorMessage, formatDate } from '@/lib/utils';

const inp = 'w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';
const lbl = 'block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide';

const EMPTY_FORM = { name: '', purpose: '', code: '', discount_percent: '' };

export default function CouponsPage() {
  const [coupons, setCoupons]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await paymentService.getCoupons();
      setCoupons(res.data);
    } catch {
      setError('Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await paymentService.createCoupon({
        ...form,
        code: form.code.toUpperCase(),
        discount_percent: Number(form.discount_percent),
      });
      setForm(EMPTY_FORM);
      setSuccess('Coupon created.');
      await fetchCoupons();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (coupon) => {
    setTogglingId(coupon.id);
    try {
      await paymentService.updateCoupon(coupon.id, { is_active: !coupon.is_active });
      setCoupons((prev) =>
        prev.map((c) => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c)
      );
    } catch {
      setError('Failed to update.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await paymentService.deleteCoupon(deleteId);
      setCoupons((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError('Failed to delete.');
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Coupons</h1>
        <p className="text-sm text-slate-500">Create discount codes for eSewa payments.</p>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-800 mb-4">New Coupon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Person / Recipient Name</label>
            <input
              type="text" required placeholder="e.g. Aarav Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>Purpose</label>
            <input
              type="text" placeholder="e.g. Teacher referral, Scholarship"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>Coupon Code</label>
            <input
              type="text" required placeholder="e.g. AARAV50"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className={`${inp} font-mono tracking-wide`}
            />
          </div>
          <div>
            <label className={lbl}>Discount %</label>
            <input
              type="number" required min="1" max="100" placeholder="e.g. 20"
              value={form.discount_percent}
              onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
              className={inp}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Coupon'}
          </button>
          {success && <span className="text-xs text-emerald-600 font-medium">{success}</span>}
          {error   && <span className="text-xs text-red-500">{error}</span>}
        </div>
      </form>

      {/* Coupon table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#1CA3FD] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No coupons yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Code', 'Person', 'Purpose', 'Discount', 'Uses', 'Created', 'Active', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs tracking-wider">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">{c.name}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{c.purpose || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 ring-1 ring-violet-200">
                        {c.discount_percent}% off
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs font-medium">{c.uses}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggle(c)}
                        disabled={togglingId === c.id}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
                          c.is_active ? 'bg-[#1CA3FD]' : 'bg-slate-200'
                        }`}
                        role="switch" aria-checked={c.is_active}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${c.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Coupon?</h3>
            <p className="text-sm text-slate-500 mb-5">This cannot be undone. Existing payments using this coupon are not affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-slate-700 text-sm font-medium py-2 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 rounded-xl transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
