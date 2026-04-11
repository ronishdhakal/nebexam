'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useConfigStore from '@/store/configStore';
import { paymentService } from '@/services/users.service';

const FEATURES = [
  { icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>, label: 'Full notes for all subjects — Class 10, 11 & 12' },
  { icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, label: 'Complete question bank with answers' },
  { icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>, label: 'Past exam papers & model questions' },
  { icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label: 'PDF notes download' },
  { icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: 'Science & Management stream coverage' },
  { icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, label: 'Unlimited answer reveals' },
];

const PLANS = [
  {
    key: '1month',
    name: '1 Month',
    months: 1,
    highlight: false,
    badge: null,
    desc: 'Perfect for exam season',
    color: 'border-slate-200',
    btnColor: 'bg-slate-900 hover:bg-slate-700 text-white',
  },
  {
    key: '3month',
    name: '3 Months',
    months: 3,
    highlight: true,
    badge: 'Most Popular',
    desc: 'Best for a full term',
    color: 'border-[#1CA3FD]',
    btnColor: 'bg-[#1CA3FD] hover:bg-[#179aef] text-white',
  },
  {
    key: '1year',
    name: '1 Year',
    months: 12,
    highlight: false,
    badge: 'Best Value',
    desc: 'Full academic year coverage',
    color: 'border-slate-200',
    btnColor: 'bg-violet-600 hover:bg-violet-700 text-white',
  },
];

export default function SubscriptionPageClient() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { esewaEnabled, contactWa } = useConfigStore();

  const [planData, setPlanData] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    paymentService.getPlans()
      .then((res) => setPlanData(res.data || {}))
      .catch(() => setPlanData({}))
      .finally(() => setLoadingPrices(false));
  }, []);

  const isSubscribed =
    user?.subscription_tier &&
    user.subscription_tier !== 'free' &&
    (
      !user.subscription_expires_at ||
      new Date(user.subscription_expires_at) > new Date()
    );

  const handleSelectPlan = (planKey) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?next=/checkout/${planKey}`);
      return;
    }
    if (esewaEnabled) {
      router.push(`/checkout/${planKey}`);
    } else {
      const pd = planData[planKey] ?? {};
      const planName = planKey === '1month' ? '1 Month' : planKey === '3month' ? '3 Months' : '1 Year';
      const price = pd.offer_price ?? pd.amount;
      const priceLine = price ? `\nPlan: ${planName} — Rs. ${price}${pd.offer_title ? ` (${pd.offer_title})` : ''}` : `\nPlan: ${planName}`;
      const msg = encodeURIComponent(`Hello! I would like to subscribe to the NEB Exam ${planName} plan.${priceLine}\n\nPlease guide me through the payment process. Thank you!`);
      window.open(`https://wa.me/${contactWa}?text=${msg}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800 pt-14 pb-12 px-4 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1CA3FD]/10 text-[#1CA3FD] text-xs font-semibold mb-5">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          NEB Exam Premium
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Unlock Everything for Your Exam
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Get full access to notes, question banks, and past papers for Class 10, 11 &amp; 12 — all streams.
        </p>

        {/* Current subscription banner */}
        {isAuthenticated && isSubscribed && (
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 font-medium">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            You&apos;re currently on the{' '}
            <span className="font-bold capitalize">{user.subscription_tier.replace('month', ' Month').replace('year', ' Year')}</span> plan
            {user.subscription_expires_at && (
              <> · expires{' '}
                <span className="font-bold">
                  {new Date(user.subscription_expires_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </>
            )}
          </div>
        )}
      </section>

      {/* Pricing cards */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Simple, affordable pricing</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Choose the plan that fits your study schedule.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const pd         = planData[plan.key] ?? {};
            const price      = pd.amount;
            const offerTitle = pd.offer_title;
            const offerPrice = pd.offer_price;
            const hasOffer   = offerTitle && offerPrice != null;
            const displayPrice = hasOffer ? offerPrice : price;
            const perMonth   = displayPrice && plan.months > 1 ? Math.round(displayPrice / plan.months) : null;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border-2 ${plan.color} ${plan.highlight ? 'shadow-xl shadow-[#1CA3FD]/10' : 'shadow-sm'} bg-white dark:bg-slate-900 p-6 sm:p-7 transition-transform hover:-translate-y-1 duration-200`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold ${plan.highlight ? 'bg-[#1CA3FD] text-white' : 'bg-violet-600 text-white'}`}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{plan.desc}</p>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{plan.name}</h2>
                </div>

                {hasOffer && (
                  <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-bold w-fit">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                    </span>
                    {offerTitle}
                  </div>
                )}

                <div className="mb-5">
                  {loadingPrices ? (
                    <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                  ) : price != null ? (
                    <div>
                      {hasOffer && (
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm text-slate-400 line-through">Rs. {price}</span>
                          <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                            Save Rs. {price - offerPrice}
                          </span>
                        </div>
                      )}
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white">Rs. {displayPrice}</span>
                      </div>
                      {perMonth && (
                        <p className="text-xs text-slate-400 mt-1">Rs. {perMonth}/month</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">—</span>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {FEATURES.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <span className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-[#1CA3FD]' : 'text-emerald-500'}`}>{f.icon}</span>
                      {f.label}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.key)}
                  disabled={loadingPrices && price == null}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${plan.btnColor} disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {esewaEnabled ? (
                    <>
                      Pay with
                      <span className="inline-flex items-center bg-white rounded px-1.5 py-0.5"><Image src="/assets/esewa.png" alt="eSewa" width={56} height={19} className="h-[19px] w-auto object-contain" /></span>
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.28 7.041L.787 23.41l4.473-1.434A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.163 0-4.181-.581-5.912-1.595l-.424-.252-3.375 1.082 1.1-3.292-.275-.447A9.954 9.954 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                      Message on WhatsApp to Pay
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          All plans give you the same full access. Choose based on how long you need it.
        </p>
      </section>

      {/* What's included */}
      <section className="bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-3">
            Everything included in every plan
          </h2>
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-10">
            No tiers, no hidden limits — every paid plan gets the full experience.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'All Subjects', body: 'Every subject for Class 10, 11, and 12 across Science and Management streams.' },
              { title: 'Rich Text Notes', body: 'Structured chapter notes written specifically for the NEB syllabus.' },
              { title: 'PDF Downloads', body: 'Download chapter PDFs for offline study before your exams.' },
              { title: 'Question Bank', body: 'MCQs, short answers, long answers, past papers — all in one place.' },
              { title: 'Answer Reveals', body: 'Reveal full model answers for any question without limits.' },
              { title: 'Instant Access', body: 'Subscription activates immediately after payment confirmation.' },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
                <div className="w-8 h-8 rounded-lg bg-[#1CA3FD]/10 flex items-center justify-center mb-3">
                  <svg width="15" height="15" fill="none" stroke="#1CA3FD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-10">
          Common questions
        </h2>
        <div className="space-y-5">
          {[
            {
              q: 'When does my subscription start?',
              a: 'Your subscription activates immediately after your payment is verified — usually within a few seconds.',
            },
            {
              q: 'Can I switch plans or renew early?',
              a: 'Yes. Purchasing a new plan before your current one expires will extend your access accordingly.',
            },
            {
              q: 'Which classes and streams are covered?',
              a: 'All content covers Classes 10, 11, and 12 — both Science and Management streams.',
            },
            {
              q: 'What payment methods are accepted?',
              a: esewaEnabled
                ? 'We currently accept payments via eSewa, Nepal\'s leading digital wallet.'
                : 'Subscriptions are processed through WhatsApp. Contact us and we\'ll guide you through the process.',
            },
          ].map((item) => (
            <div key={item.q} className="border border-slate-100 dark:border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{item.q}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-[#1CA3FD] to-[#0e7dd4] py-14 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight">
            Ready to ace your NEB exams?
          </h2>
          <p className="text-white/80 text-sm mb-6 max-w-sm mx-auto">
            Join thousands of students who study smarter with NEB Exam. Start today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleSelectPlan('3month')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-[#1CA3FD] rounded-xl text-sm font-bold hover:bg-slate-50 transition shadow-lg shadow-black/10"
            >
              Get Started — 3 Months
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button
              onClick={() => handleSelectPlan('1month')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-white/40 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition"
            >
              Start with 1 Month
            </button>
          </div>

          {!isAuthenticated && (
            <p className="mt-5 text-white/60 text-xs">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-white underline font-medium">Sign in</Link>
            </p>
          )}
        </div>
      </section>

    </div>
  );
}
