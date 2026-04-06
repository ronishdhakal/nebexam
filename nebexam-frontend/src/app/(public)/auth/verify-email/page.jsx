'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useAuth from '@/hooks/useAuth';
import { authService } from '@/services/users.service';
import { getErrorMessage } from '@/lib/utils';

const inp = 'w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState(null);
  const [resendMsg, setResendMsg] = useState(null);
  const { handleVerifyEmail } = useAuth();

  useEffect(() => {
    if (!email) router.replace('/auth/register');
  }, [email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await handleVerifyEmail(email, code);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMsg(null);
    setError(null);
    setResending(true);
    try {
      await authService.resendVerification(email);
      setResendMsg('A new verification code has been sent to your email.');
      setCode('');
    } catch (err) {
      setError(err.response?.data?.detail || getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 justify-center">
            <Image src="/assets/logo.svg" alt="NEB Exam" width={130} height={38} className="h-9 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Verify your email</h1>
          <p className="text-slate-500 text-sm mt-1">
            We sent a 6-digit code to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-8">
          <div className="mb-5 p-3.5 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-xl flex items-start gap-2.5">
            <svg className="shrink-0 mt-0.5" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>
              Please check your inbox (and spam folder). The OTP may take a few seconds to arrive.
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}
          {resendMsg && (
            <div className="mb-5 p-3.5 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl">
              {resendMsg}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className={`${inp} text-center text-2xl font-bold tracking-[0.5em]`}
              />
              <p className="text-xs text-slate-400 mt-1.5 text-center">
                Expires in 15 minutes &nbsp;·&nbsp;
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[#1CA3FD] hover:underline font-medium disabled:opacity-50"
                >
                  {resending ? 'Sending…' : 'Resend code'}
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white font-semibold py-3 rounded-xl transition-colors shadow-sm shadow-[#1CA3FD]/20 disabled:opacity-50 mt-2"
            >
              {loading ? 'Verifying…' : 'Verify & Activate Account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500 text-center">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#1CA3FD] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
