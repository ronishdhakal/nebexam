'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getErrorMessage, formatDate } from '@/lib/utils';

const inp = 'w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';
const lbl = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

const TIERS = [
  { value: 'free',   label: 'Free' },
  { value: '1month', label: '1 Month' },
  { value: '3month', label: '3 Months' },
  { value: '1year',  label: '1 Year' },
];

const TIER_DAYS = { '1month': 30, '3month': 90, '1year': 365 };
const LEVELS = ['10', '11', '12'];

export default function EditUserPage({ params: rawParams }) {
  const params = use(rawParams);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const [pwForm, setPwForm]   = useState({ password: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState(null);
  const [pwSaved, setPwSaved] = useState(false);


  const router = useRouter();

  useEffect(() => {
    api.get(`/users/${params.id}/`)
      .then((res) => {
        setUser(res.data);
        setForm({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          level: res.data.level || '',
          subscription_tier: res.data.subscription_tier || 'free',
          subscription_expires_at: res.data.subscription_expires_at
            ? res.data.subscription_expires_at.slice(0, 16)
            : '',
          is_active: res.data.is_active ?? true,
          is_staff: res.data.is_staff ?? false,
        });
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        subscription_expires_at: form.subscription_expires_at || null,
      };
      await api.patch(`/users/${params.id}/`, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setPwError(null);
    if (pwForm.password !== pwForm.confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    if (pwForm.password.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await api.post(`/users/${params.id}/set-password/`, { password: pwForm.password });
      setPwSaved(true);
      setPwForm({ password: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(getErrorMessage(err));
    } finally {
      setPwLoading(false);
    }
  };

  if (error && !form) return <p className="text-sm text-red-500 p-6">{error}</p>;
  if (!form) return <p className="text-sm text-gray-500 p-6">Loading...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/users')}
          className="text-xs text-[#1CA3FD] hover:text-[#0e8fe0] mb-1.5 inline-flex items-center gap-1 font-medium"
        >
          ← Back to Users
        </button>
        <div className="flex items-center gap-3 mt-1">
          <div className="w-10 h-10 rounded-full bg-[#1CA3FD]/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-[#1CA3FD]">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Joined {user?.date_joined ? formatDate(user.date_joined) : '—'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        {/* Basic info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 9800000000"
              className={inp}
            />
          </div>
        </div>

        <div>
          <label className={lbl}>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inp}
          />
        </div>

        <div>
          <label className={lbl}>Class Level</label>
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className={inp}
          >
            <option value="">— Not set —</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>Class {l}</option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Subscription</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Plan</label>
              <select
                value={form.subscription_tier}
                onChange={(e) => {
                  const newTier = e.target.value;
                  const days = TIER_DAYS[newTier];
                  if (newTier === 'free') {
                    // Clearing subscription also clears expiry
                    setForm({ ...form, subscription_tier: newTier, subscription_expires_at: '' });
                  } else if (!form.subscription_expires_at && days) {
                    // Paid tier selected with no expiry — auto-fill based on plan duration
                    const d = new Date();
                    d.setDate(d.getDate() + days);
                    setForm({ ...form, subscription_tier: newTier, subscription_expires_at: d.toISOString().slice(0, 16) });
                  } else {
                    setForm({ ...form, subscription_tier: newTier });
                  }
                }}
                className={inp}
              >
                {TIERS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Expires At</label>
              <input
                type="datetime-local"
                value={form.subscription_expires_at}
                onChange={(e) => setForm({ ...form, subscription_expires_at: e.target.value })}
                className={inp}
              />
            </div>
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            <p className="text-xs text-slate-400 w-full">Quick set expiry:</p>
            {[
              { label: '1 month', days: 30 },
              { label: '3 months', days: 90 },
              { label: '6 months', days: 180 },
              { label: '1 year', days: 365 },
            ].map(({ label, days }) => (
              <button
                key={days}
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + days);
                  setForm({ ...form, subscription_expires_at: d.toISOString().slice(0, 16) });
                }}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-[#1CA3FD] hover:text-[#1CA3FD] transition-colors"
              >
                + {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setForm({ ...form, subscription_expires_at: '' })}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 transition-colors"
            >
              Clear expiry
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, subscription_tier: 'free', subscription_expires_at: '' })}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-semibold"
            >
              Clear subscription
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Account Flags</p>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Email Verification:</span>
            {user?.is_email_verified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Not Verified
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded border-slate-300 text-[#1CA3FD] focus:ring-[#1CA3FD]"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Account Active</span>
                <p className="text-xs text-slate-400">Disabled accounts cannot log in.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_staff}
                onChange={(e) => setForm({ ...form, is_staff: e.target.checked })}
                className="rounded border-slate-300 text-[#1CA3FD] focus:ring-[#1CA3FD]"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Staff / Admin</span>
                <p className="text-xs text-slate-400">Grants access to the admin panel.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/users')}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* ── Set Password ── */}
      <form onSubmit={handleSetPassword} className="space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-slate-400">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Set Password</p>
        </div>
        <p className="text-xs text-slate-400 -mt-1">
          Setting a new password will immediately log the user out of all devices.
        </p>

        {pwError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{pwError}</div>
        )}
        {pwSaved && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
            Password updated. User has been logged out of all devices.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={pwForm.password}
              onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
              placeholder="Min 8 characters"
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>Confirm Password</label>
            <input
              type="password"
              required
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              placeholder="Repeat password"
              className={inp}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pwLoading}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          {pwLoading ? 'Updating…' : 'Set Password'}
        </button>
      </form>
    </div>
  );
}
