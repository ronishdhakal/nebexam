'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import useConfigStore from '@/store/configStore';
import { authService } from '@/services/users.service';
import { getErrorMessage } from '@/lib/utils';

const inp = 'w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';

const LEVEL_LABELS = { '10': 'Class 10', '11': 'Class 11', '12': 'Class 12' };
const STREAM_LABELS = { science: 'Science', management: 'Management' };

const NEPAL_DISTRICTS = [
  // Koshi Province
  'Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga',
  'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur',
  // Madhesh Province
  'Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha',
  // Bagmati Province
  'Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur',
  'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok',
  // Gandaki Province
  'Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi',
  'Nawalpur', 'Parbat', 'Syangja', 'Tanahu',
  // Lumbini Province
  'Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Nawalparasi West',
  'Palpa', 'Pyuthan', 'Rolpa', 'Rukum East', 'Rupandehi',
  // Karnali Province
  'Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu',
  'Rukum West', 'Salyan', 'Surkhet',
  // Sudurpashchim Province
  'Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur',
].sort();

function EyeIcon({ open }) {
  return open ? (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function DistrictSelect({ value, onChange, hasError }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const filtered = NEPAL_DISTRICTS.filter((d) =>
    d.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={inp + ' text-left flex items-center justify-between' + (hasError ? ' border-red-300 focus:ring-red-300' : '')}
      >
        <span className={value ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
          {value || 'Select district'}
        </span>
        <svg
          width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
          className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="absolute z-30 w-full mt-1 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100 dark:border-slate-600">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search district…"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-600 rounded-lg outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { onChange(d); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  value === d
                    ? 'text-[#1CA3FD] font-semibold bg-[#1CA3FD]/5'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                {d}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-400 text-center">No district found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', name: '', phone: '', district: '', password: '', level: '', stream: '' });
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resendingOtp, setResendingOtp] = useState(false);
  const submittingRef = useRef(false);
  const { handleRegister } = useAuth();
  const emailVerificationEnabled = useConfigStore((s) => s.emailVerificationEnabled);
  const router = useRouter();

  const needsStream = form.level === '11' || form.level === '12';
  const pwMatch = !confirmPw || form.password === confirmPw;
  const phoneValid = /^\d{10}$/.test(form.phone);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phoneValid) { setError('Please enter a correct phone number.'); return; }
    if (!form.district) { setError('Please select your district.'); return; }
    if (!form.level) { setError('Please select your class.'); return; }
    if (needsStream && !form.stream) { setError('Please select your stream (Science or Management).'); return; }
    if (form.password !== confirmPw) { setError('Passwords do not match.'); return; }
    setError(null);
    setShowConfirmModal(true);
  };

  const doRegister = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const data = await handleRegister(form);
      if (data.access) {
        router.push('/dashboard');
      } else {
        const email = data.email || form.email;
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setShowConfirmModal(false);
      const data = err.response?.data;
      if (data?.unverified_email) {
        setUnverifiedEmail(data.email || form.email);
        setError(null);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleGoVerify = async () => {
    if (!unverifiedEmail || resendingOtp) return;
    setResendingOtp(true);
    try {
      await authService.resendVerification(unverifiedEmail);
      router.push(`/auth/verify-email?email=${encodeURIComponent(unverifiedEmail)}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setUnverifiedEmail(null);
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <>
      {/* Confirm details modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#1CA3FD]/10 flex items-center justify-center shrink-0">
                <svg width="16" height="16" fill="none" stroke="#1CA3FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Review your details</h2>
                <p className="text-xs text-slate-500">Make sure everything looks correct.</p>
              </div>
            </div>
            <div className="mb-5">
              <DetailRow label="Full Name" value={form.name} />
              <DetailRow label="Email" value={form.email} />
              <DetailRow label="Phone" value={form.phone} />
              {form.district && <DetailRow label="District" value={form.district} />}
              <DetailRow label="Class" value={LEVEL_LABELS[form.level] || '—'} />
              {needsStream && <DetailRow label="Stream" value={STREAM_LABELS[form.stream] || '—'} />}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Edit details
              </button>
              <button
                type="button"
                onClick={doRegister}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white text-sm font-semibold transition-colors shadow-sm shadow-[#1CA3FD]/20 disabled:opacity-50"
              >
                {loading ? 'Creating…' : 'Confirm & Register'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">Join thousands of NEB students preparing smarter</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 md:p-8">
            {unverifiedEmail && (
              <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800 font-medium mb-1">Email not yet verified</p>
                <p className="text-sm text-amber-700 mb-3">
                  <span className="font-semibold">{unverifiedEmail}</span> is registered but not verified. Resend the OTP to complete your account setup.
                </p>
                <button
                  type="button"
                  onClick={handleGoVerify}
                  disabled={resendingOtp}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {resendingOtp ? 'Sending OTP…' : 'Resend OTP & Verify'}
                </button>
              </div>
            )}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Full Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name" className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com" className={inp}
                  />
                </div>
              </div>

              {/* Row 2: Phone + Class */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Phone</label>
                  <input
                    type="text" required inputMode="numeric" maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="98XXXXXXXX"
                    className={inp + (form.phone && !phoneValid ? ' border-red-300 focus:ring-red-300' : '')}
                  />
                  {form.phone && !phoneValid && (
                    <p className="text-xs text-red-500 mt-1">Invalid phone number.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Class</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value, stream: '' })}
                    className={inp}
                  >
                    <option value="">Select class</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
              </div>

              {/* Row 3: District + Stream (if needed, else District full width) */}
              {needsStream ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">District</label>
                    <DistrictSelect value={form.district} onChange={(d) => setForm({ ...form, district: d })} hasError={!!error && !form.district} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Stream</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'science', label: 'Science', color: 'blue' },
                        { value: 'management', label: 'Management', color: 'emerald' },
                      ].map(({ value, label, color }) => (
                        <button
                          key={value} type="button"
                          onClick={() => setForm({ ...form, stream: value })}
                          className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                            form.stream === value
                              ? color === 'blue'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500'
                                : 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500'
                              : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">District</label>
                  <DistrictSelect value={form.district} onChange={(d) => setForm({ ...form, district: d })} hasError={!!error && !form.district} />
                </div>
              )}

              {/* Row 4: Password + Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'} required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min. 8 characters" className={inp + ' pr-11'}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'} required
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Re-enter password"
                      className={inp + ' pr-11' + (!pwMatch ? ' border-red-300 focus:ring-red-300' : '')}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {!pwMatch && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white font-semibold py-3 rounded-xl transition-colors shadow-sm shadow-[#1CA3FD]/20 disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500 text-center">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#1CA3FD] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          <p className="text-center mt-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>
    </>
  );
}
