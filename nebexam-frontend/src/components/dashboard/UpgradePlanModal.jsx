'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { paymentService } from '@/services/users.service';
import useConfigStore from '@/store/configStore';

const PAID_FEATURES = [
  'Unlimited answer reveals',
  'Solution of all Subject Model Questions',
];

const PLAN_META = [
  {
    id: 'free',
    name: 'Free',
    period: 'forever',
    features: ['4 free answer reveals', 'Class notes access', 'Browse all subjects'],
    locked:   ['Unlimited answer reveals', 'Solution of all Subject Model Questions'],
  },
  {
    id: '1month',
    name: '1 Month',
    period: '/ month',
    features: PAID_FEATURES,
  },
  {
    id: '3month',
    name: '3 Months',
    period: '/ 3 months',
    badge: 'MOST POPULAR',
    highlight: true,
    features: PAID_FEATURES,
    savingsNote: (prices) => prices['3month'] && prices['1month']
      ? `Save Rs. ${prices['1month'] * 3 - prices['3month']}`
      : null,
  },
  {
    id: '1year',
    name: '1 Year',
    period: '/ year',
    badge: 'BEST VALUE',
    bestValue: true,
    features: PAID_FEATURES,
    savingsNote: (prices) => prices['1year'] && prices['1month']
      ? `Save Rs. ${prices['1month'] * 12 - prices['1year']}`
      : null,
  },
];

function WaIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function waLink(number, planName, price, offerTitle) {
  const priceLine = price ? `\nPlan: ${planName} — Rs. ${price}${offerTitle ? ` (${offerTitle})` : ''}` : `\nPlan: ${planName}`;
  const msg = encodeURIComponent(`Hello! I would like to purchase the NEB Exam ${planName} plan.${priceLine}\n\nPlease guide me through the payment process. Thank you!`);
  return `https://wa.me/${number}?text=${msg}`;
}

export default function UpgradePlanModal({ currentTier, onClose }) {
  const esewaEnabled = useConfigStore((s) => s.esewaEnabled);
  const contactWa    = useConfigStore((s) => s.contactWa);
  const router       = useRouter();

  const [plans, setPlans]           = useState({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    paymentService.getPlans()
      .then((res) => setPlans(res.data))
      .catch(() => setPlans({ '1month': { amount: 100 }, '3month': { amount: 200 }, '1year': { amount: 300 } }))
      .finally(() => setLoadingPrices(false));
  }, []);

  const handleCheckout = (planId) => {
    onClose();
    router.push(`/checkout/${planId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl sm:my-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#1CA3FD] to-[#0e6abf] px-5 pt-6 pb-8 sm:px-8 sm:pt-8 sm:pb-10 text-white">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Unlock Full Access</p>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-1">Stop Guessing. Start Scoring.</h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-md">Get solutions to every Subject Model Question + full notes, PDFs & past papers — everything you need to ace NEB.</p>
        </div>

        {/* Plans */}
        <div className="px-3 pb-4 sm:px-6 sm:pb-6 -mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {PLAN_META.map((plan) => {
              const isCurrent   = (currentTier || 'free') === plan.id;
              const isHighlight = plan.highlight;
              const isBestValue = plan.bestValue;
              const planData    = plans[plan.id] ?? {};
              const amount      = planData.amount;
              const offerTitle  = planData.offer_title;
              const offerPrice  = planData.offer_price;
              const hasOffer    = offerTitle && offerPrice != null;
              const savings     = plan.savingsNote?.(
                Object.fromEntries(Object.entries(plans).map(([k, v]) => [k, v?.amount]))
              );

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl flex flex-col transition-all ${
                    isHighlight
                      ? 'bg-[#1CA3FD] text-white shadow-xl shadow-[#1CA3FD]/30 sm:scale-[1.02]'
                      : isBestValue
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 border-2 border-violet-500'
                      : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-3 py-0.5 rounded-full whitespace-nowrap tracking-widest ${
                      isHighlight ? 'bg-white text-[#1CA3FD]' : 'bg-violet-200 text-violet-800'
                    }`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-3 sm:p-5 flex flex-col flex-1">
                    <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 ${
                      isHighlight || isBestValue ? 'text-white/70' : 'text-slate-400'
                    }`}>{plan.name}</p>

                    {hasOffer && (
                      <div className={`mb-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                        isHighlight ? 'bg-amber-300/30 text-amber-200' : isBestValue ? 'bg-amber-300/30 text-amber-200' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                        </span>
                        {offerTitle}
                      </div>
                    )}

                    <div className="mb-0.5">
                      {plan.id === 'free' ? (
                        <span className={`text-2xl sm:text-3xl font-extrabold ${isHighlight || isBestValue ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          Rs. 0
                        </span>
                      ) : loadingPrices ? (
                        <span className="h-7 sm:h-8 w-16 sm:w-20 bg-white/20 dark:bg-slate-700 rounded animate-pulse inline-block" />
                      ) : hasOffer ? (
                        <>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[10px] sm:text-xs line-through ${isHighlight || isBestValue ? 'text-white/50' : 'text-slate-400'}`}>
                              Rs. {amount ?? '—'}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isHighlight || isBestValue ? 'bg-red-400/30 text-red-200' : 'bg-red-50 text-red-500'
                            }`}>
                              Save Rs. {amount - offerPrice}
                            </span>
                          </div>
                          <span className={`text-2xl sm:text-3xl font-extrabold ${isHighlight || isBestValue ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                            Rs. {offerPrice}
                          </span>
                        </>
                      ) : (
                        <span className={`text-2xl sm:text-3xl font-extrabold ${isHighlight || isBestValue ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          Rs. {amount ?? '—'}
                        </span>
                      )}
                    </div>

                    <p className={`text-[10px] sm:text-xs mb-2 ${isHighlight || isBestValue ? 'text-white/60' : 'text-slate-400'}`}>
                      {plan.period}
                    </p>

                    {savings && (
                      <span className={`inline-block mb-2 sm:mb-3 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                        isHighlight ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'
                      }`}>{savings}</span>
                    )}

                    <ul className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-5 flex-1">
                      {plan.features?.map((f) => (
                        <li key={f} className={`flex items-start gap-1.5 text-[10px] sm:text-xs ${isHighlight || isBestValue ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}`}>
                          <svg className="shrink-0 mt-0.5" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                          {f}
                        </li>
                      ))}
                      {plan.locked?.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-[10px] sm:text-xs text-slate-300 dark:text-slate-600">
                          <svg className="shrink-0 mt-0.5" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isCurrent ? (
                      <div className={`w-full py-2 rounded-xl text-[10px] sm:text-xs font-bold text-center ${
                        isHighlight || isBestValue ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-700 text-slate-400'
                      }`}>Current Plan</div>
                    ) : plan.id === 'free' ? (
                      <div className="w-full py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-slate-400 text-[10px] sm:text-xs font-semibold text-center">
                        Default Plan
                      </div>
                    ) : esewaEnabled ? (
                      <button
                        onClick={() => handleCheckout(plan.id)}
                        disabled={loadingPrices}
                        className={`w-full py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition disabled:opacity-60 ${
                          isHighlight ? 'bg-white text-[#1CA3FD] hover:bg-white/90'
                            : isBestValue ? 'bg-white text-violet-700 hover:bg-white/90'
                            : 'bg-[#1CA3FD] text-white hover:bg-[#0e8fe0]'
                        }`}
                      >
                        Pay with
                        <span className="inline-flex items-center bg-white rounded px-1 py-0.5"><Image
                          src="/assets/esewa.png"
                          alt="eSewa"
                          width={42}
                          height={15}
                          className="h-[13px] sm:h-[15px] w-auto object-contain"
                        /></span>
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <a
                          href={waLink(contactWa, plan.name, hasOffer ? offerPrice : amount, hasOffer ? offerTitle : null)}
                          target="_blank" rel="noopener noreferrer"
                          className={`w-full py-2.5 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            isHighlight ? 'bg-white text-[#1CA3FD] hover:bg-white/90'
                              : isBestValue ? 'bg-white text-violet-700 hover:bg-white/90'
                              : 'bg-[#25D366] text-white hover:bg-[#1fb85a]'
                          }`}
                        >
                          <WaIcon />
                          <span className="hidden sm:inline">Message on WhatsApp to Pay</span>
                          <span className="sm:hidden">Message on WhatsApp to Pay</span>
                        </a>
                        <p className={`text-[9px] sm:text-[10px] text-center ${isHighlight || isBestValue ? 'text-white/60' : 'text-slate-400'}`}>
                          Click above → send message → done!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              {esewaEnabled ? (
                <>
                  <span className="text-xs text-slate-400">Secure payment via</span>
                  <span className="inline-flex items-center bg-white rounded px-1.5 py-0.5"><Image src="/assets/esewa.png" alt="eSewa" width={52} height={19} className="h-[19px] w-auto object-contain" /></span>
                  <span className="text-xs text-slate-400">· Activated instantly.</span>
                </>
              ) : (
                <span className="text-xs text-slate-400 text-center sm:text-left">Tap the WhatsApp button on your plan → send the message → we activate within minutes.</span>
              )}
            </div>
            <a
              href={`https://wa.me/${contactWa}`}
              target="_blank" rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-[#1CA3FD] transition font-medium whitespace-nowrap"
            >
              Need help? Chat on WhatsApp →
            </a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
