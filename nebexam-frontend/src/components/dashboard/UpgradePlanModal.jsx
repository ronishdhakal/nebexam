'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { paymentService } from '@/services/users.service';
import useConfigStore from '@/store/configStore';

const WA_NUMBER = '9779745450062';

const PLAN_META = [
  {
    id: 'free',
    name: 'Free',
    period: 'forever',
    features: ['4 free answer reveals', 'Class notes access', 'Browse all subjects'],
    locked:   ['Unlimited answer reveals', 'All PDF notes', 'Full past papers', 'Model question sets'],
  },
  {
    id: '1month',
    name: '1 Month',
    period: '/ month',
  },
  {
    id: '3month',
    name: '3 Months',
    period: '/ 3 months',
    badge: 'MOST POPULAR',
    highlight: true,
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

function waLink(planName) {
  const msg = encodeURIComponent(`Hi, I would like to purchase the ${planName} Plan on NEB Exam. Please assist me with the payment process.`);
  return `https://wa.me/${WA_NUMBER}?text=${msg}`;
}

export default function UpgradePlanModal({ currentTier, onClose }) {
  const esewaEnabled = useConfigStore((s) => s.esewaEnabled);
  const router       = useRouter();

  const [prices, setPrices]           = useState({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    paymentService.getPlans()
      .then((res) => setPrices(res.data))
      .catch(() => setPrices({ '1month': { amount: 100 }, '3month': { amount: 200 }, '1year': { amount: 300 } }))
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
        <div className="relative bg-gradient-to-br from-[#1CA3FD] to-[#0e6abf] px-8 pt-8 pb-10 text-white">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Upgrade</p>
          <h2 className="text-2xl font-extrabold mb-1">Choose Your Plan</h2>
          <p className="text-sm text-white/70">Unlock full access to notes, PDFs, and past papers</p>
        </div>

        {/* Plans */}
        <div className="px-6 pb-6 -mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLAN_META.map((plan) => {
              const isCurrent   = (currentTier || 'free') === plan.id;
              const isHighlight = plan.highlight;
              const isBestValue = plan.bestValue;
              const amount      = prices[plan.id]?.amount;
              const savings     = plan.savingsNote?.(
                Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v?.amount]))
              );

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl flex flex-col transition-all ${
                    isHighlight
                      ? 'bg-[#1CA3FD] text-white shadow-xl shadow-[#1CA3FD]/30 scale-[1.02]'
                      : isBestValue
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 border-2 border-violet-500'
                      : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-extrabold px-3 py-0.5 rounded-full whitespace-nowrap tracking-widest ${
                      isHighlight ? 'bg-white text-[#1CA3FD]' : 'bg-violet-200 text-violet-800'
                    }`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                      isHighlight || isBestValue ? 'text-white/70' : 'text-slate-400'
                    }`}>{plan.name}</p>

                    <div className="flex items-baseline gap-1 mb-0.5">
                      {plan.id === 'free' ? (
                        <span className={`text-3xl font-extrabold ${isHighlight || isBestValue ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          Rs. 0
                        </span>
                      ) : loadingPrices ? (
                        <span className="h-8 w-20 bg-white/20 dark:bg-slate-700 rounded animate-pulse inline-block" />
                      ) : (
                        <span className={`text-3xl font-extrabold ${isHighlight || isBestValue ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          Rs. {amount ?? '—'}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs mb-2 ${isHighlight || isBestValue ? 'text-white/60' : 'text-slate-400'}`}>
                      {plan.period}
                    </p>

                    {savings && (
                      <span className={`inline-block mb-3 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                        isHighlight ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'
                      }`}>{savings}</span>
                    )}

                    <ul className="space-y-2 mb-5 flex-1">
                      {plan.features?.map((f) => (
                        <li key={f} className={`flex items-start gap-2 text-xs ${isHighlight || isBestValue ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}`}>
                          <svg className="shrink-0 mt-0.5" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                          {f}
                        </li>
                      ))}
                      {plan.locked?.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-slate-300 dark:text-slate-600">
                          <svg className="shrink-0 mt-0.5" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isCurrent ? (
                      <div className={`w-full py-2.5 rounded-xl text-xs font-bold text-center ${
                        isHighlight || isBestValue ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-700 text-slate-400'
                      }`}>Current Plan</div>
                    ) : plan.id === 'free' ? (
                      <div className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-slate-400 text-xs font-semibold text-center">
                        Default Plan
                      </div>
                    ) : esewaEnabled ? (
                      <button
                        onClick={() => handleCheckout(plan.id)}
                        disabled={loadingPrices}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-60 ${
                          isHighlight ? 'bg-white text-[#1CA3FD] hover:bg-white/90'
                            : isBestValue ? 'bg-white text-violet-700 hover:bg-white/90'
                            : 'bg-[#1CA3FD] text-white hover:bg-[#0e8fe0]'
                        }`}
                      >
                        Pay with
                        <Image
                          src="/assets/esewa.png"
                          alt="eSewa"
                          width={36}
                          height={13}
                          className={`h-3.5 w-auto object-contain ${!isHighlight && !isBestValue ? 'brightness-0 invert' : ''}`}
                        />
                      </button>
                    ) : (
                      <a
                        href={waLink(plan.name)}
                        target="_blank" rel="noopener noreferrer"
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          isHighlight ? 'bg-white text-[#1CA3FD] hover:bg-white/90'
                            : isBestValue ? 'bg-white text-violet-700 hover:bg-white/90'
                            : 'bg-[#1CA3FD] text-white hover:bg-[#0e8fe0]'
                        }`}
                      >
                        <WaIcon />
                        Buy {plan.name} Plan
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              {esewaEnabled ? (
                <>
                  <span className="text-xs text-slate-400">Secure payment via</span>
                  <Image src="/assets/esewa.png" alt="eSewa" width={44} height={16} className="h-4 w-auto object-contain" />
                  <span className="text-xs text-slate-400">· Activated instantly.</span>
                </>
              ) : (
                <span className="text-xs text-slate-400">Pay via WhatsApp. Our team will activate your plan within minutes.</span>
              )}
            </div>
            <a
              href={`https://wa.me/${WA_NUMBER}`}
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
