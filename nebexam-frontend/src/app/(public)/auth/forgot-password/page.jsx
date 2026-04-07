'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/users.service';

const inp = 'w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep]         = useState(1);
  const [email, setEmail]       = useState('');
  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    setError(null);
    setLoading(true);
    try {
      await authService.resetPassword(email, code, password);
      router.push('/auth/login?reset=1');
    } catch (err) {
      setError(err.response?.data?.detail || 'The code is incorrect or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {step === 1 ? 'Forgot Password' : 'Enter Reset Code'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {step === 1
              ? 'Enter your email to receive a 6-digit reset code'
              : `We sent a code to ${email}`}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 md:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inp}
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white font-semibold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-2">
                {loading ? 'Sending…' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">6-Digit Code</label>
                <input
                  type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} required
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className={`${inp} text-center text-2xl font-bold tracking-[0.5em]`}
                />
                <p className="text-xs text-slate-400 mt-1.5 text-center">
                  Expires in 15 minutes &nbsp;·&nbsp;
                  <button type="button" onClick={() => { setStep(1); setError(null); }}
                    className="text-[#1CA3FD] hover:underline font-medium">
                    Resend code
                  </button>
                </p>
              </div>

              {/* New password + confirm side by side on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">New Password</label>
                  <input type="password" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                  <input type="password" required value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••" className={inp} />
                </div>
              </div>

              <button type="submit" disabled={loading || code.length !== 6}
                className="w-full bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white font-semibold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-2">
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-slate-500 text-center">
            Remembered it?{' '}
            <Link href="/auth/login" className="text-[#1CA3FD] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
