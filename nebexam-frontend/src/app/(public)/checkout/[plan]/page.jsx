'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useAuthStore from '@/store/authStore';
import { paymentService } from '@/services/users.service';

const PLAN_META = {
  '1month': { name: '1 Month',  months: 1,  badge: 'bg-blue-50 text-blue-700 ring-blue-200' },
  '3month': { name: '3 Months', months: 3,  badge: 'bg-[#1CA3FD]/10 text-[#1CA3FD] ring-[#1CA3FD]/20' },
  '1year':  { name: '1 Year',   months: 12, badge: 'bg-violet-50 text-violet-700 ring-violet-200' },
};

const inp = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';

export default function CheckoutPage({ params: rawParams }) {
  const { plan }   = use(rawParams);
  const router     = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const meta = PLAN_META[plan];

  const [basePrice, setBasePrice]       = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  const [couponInput, setCouponInput]     = useState('');
  const [coupon, setCoupon]               = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError]     = useState(null);

  const [paying, setPaying]     = useState(false);
  const [payError, setPayError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?next=/checkout/${plan}`);
      return;
    }
    if (!meta) {
      router.push('/dashboard');
      return;
    }
    paymentService.getPlans()
      .then((res) => setBasePrice(res.data[plan]?.amount ?? null))
      .catch(() => setBasePrice(null))
      .finally(() => setLoadingPrice(false));
    // Track that this user visited checkout (fire-and-forget)
    paymentService.recordCheckoutVisit(plan).catch(() => {});
  }, [isAuthenticated, plan, meta, router]);

  const finalPrice  = coupon ? coupon.final_amount : basePrice;
  const discountAmt = coupon && basePrice != null ? basePrice - coupon.final_amount : 0;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCoupon(null);
    try {
      const res = await paymentService.validateCoupon(couponInput.trim(), plan);
      setCoupon({ code: couponInput.trim().toUpperCase(), ...res.data });
    } catch (err) {
      setCouponError(err?.response?.data?.detail || 'Invalid or inactive code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handlePay = async () => {
    setPaying(true);
    setPayError(null);
    try {
      const res = await paymentService.initiate(plan, coupon?.code || '');
      const { url, ...params } = res.data;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      Object.entries(params).forEach(([k, v]) => {
        const field = document.createElement('input');
        field.type = 'hidden'; field.name = k; field.value = v;
        form.appendChild(field);
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      setPayError('Could not connect to eSewa. Please try again.');
      setPaying(false);
    }
  };

  if (!isAuthenticated || !meta) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1CA3FD] transition mb-7 font-medium"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Account + Coupon ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Account details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1CA3FD]/10 text-[#1CA3FD] text-xs font-bold flex items-center justify-center">1</span>
                Account Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                  <div className={`${inp} bg-slate-50 text-slate-600 cursor-not-allowed`}>{user?.name || '—'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
                  <div className={`${inp} bg-slate-50 text-slate-600 cursor-not-allowed`}>{user?.email || '—'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
                  <div className={`${inp} bg-slate-50 text-slate-600 cursor-not-allowed`}>
                    {user?.phone || <span className="text-slate-400 italic">Not set</span>}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Wrong account?{' '}
                <Link href="/dashboard" className="text-[#1CA3FD] hover:underline font-medium">Go to dashboard</Link>
              </p>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1CA3FD]/10 text-[#1CA3FD] text-xs font-bold flex items-center justify-center">2</span>
                Coupon / Referral Code
                <span className="text-xs font-normal text-slate-400">(optional)</span>
              </h2>

              {coupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-emerald-800 font-mono">{coupon.code}</p>
                      <p className="text-xs text-emerald-600">{coupon.discount_percent}% discount — you save Rs. {discountAmt}</p>
                    </div>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-xs text-emerald-600 hover:text-red-500 font-semibold transition">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Enter coupon or referral code"
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-sans bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent uppercase tracking-wider"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    {couponLoading ? '…' : 'Apply'}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {couponError}
                </p>
              )}
            </div>

          </div>

          {/* ── Right: Order summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
              <h2 className="text-sm font-bold text-slate-800 mb-5">Order Summary</h2>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-slate-900">NEB Exam Subscription</p>
                  <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${meta.badge}`}>
                    {meta.name} Plan
                  </span>
                </div>
                <div className="text-right">
                  {loadingPrice ? (
                    <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-700">Rs. {basePrice ?? '—'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span>Rs. {loadingPrice ? '…' : (basePrice ?? '—')}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-xs text-emerald-600 font-medium">
                    <span>Coupon ({coupon.discount_percent}% off)</span>
                    <span>− Rs. {discountAmt}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100 mb-6">
                <span className="text-sm font-bold text-slate-900">Total</span>
                {loadingPrice ? (
                  <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <span className="text-xl font-extrabold text-slate-900">Rs. {finalPrice ?? '—'}</span>
                )}
              </div>

              <button
                onClick={handlePay}
                disabled={paying || loadingPrice || finalPrice === null}
                className="w-full py-3.5 rounded-xl bg-[#60BB46] hover:bg-[#52a83a] text-white text-sm font-bold flex items-center justify-center gap-2.5 transition shadow-sm shadow-[#60BB46]/20 disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Redirecting to eSewa…
                  </>
                ) : (
                  <>
                    Pay Rs. {finalPrice ?? '—'} with
                    <span className="inline-flex items-center bg-white rounded px-1.5 py-0.5"><Image src="/assets/esewa.png" alt="eSewa" width={62} height={21} className="h-[21px] w-auto object-contain" /></span>
                  </>
                )}
              </button>

              {payError && <p className="mt-3 text-xs text-red-500 text-center">{payError}</p>}

              <p className="mt-4 text-center text-xs text-slate-400">Secured & processed by eSewa</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
