'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import useAuthStore from '@/store/authStore';
import useConfigStore from '@/store/configStore';
import { leadsService } from '@/services/leads.service';

const COUNTRIES = [
  { value: 'australia',   label: 'Australia' },
  { value: 'canada',      label: 'Canada' },
  { value: 'new_zealand', label: 'New Zealand' },
  { value: 'uk',          label: 'United Kingdom' },
  { value: 'usa',         label: 'United States' },
  { value: 'other',       label: 'Other' },
];

const LS_SUBMITTED_KEY  = 'study_abroad_submitted';
const SS_COUNT_KEY      = 'study_abroad_show_count';
const MAX_SHOWS_SESSION = 3;
const SCROLL_THRESHOLD  = 25; // percent

export default function StudyAbroadModal() {
  const { user } = useAuthStore();
  const { leadFormEnabled, leadFormTitle, leadFormImage } = useConfigStore();
  const [visible, setVisible]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const triggered                 = useRef(false);

  const [form, setForm] = useState({
    name:               '',
    phone:              '',
    email:              '',
    district:           '',
    interested_country: 'australia',
    other_country:      '',
    message:            '',
  });

  // Pre-fill from logged-in user
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name:     user.name     || prev.name,
        phone:    user.phone    || prev.phone,
        email:    user.email    || prev.email,
        district: user.district || prev.district,
      }));
    }
  }, [user]);

  // Scroll-depth trigger: show at 25% scroll, up to 3× per session
  useEffect(() => {
    if (!leadFormEnabled) return;
    if (localStorage.getItem(LS_SUBMITTED_KEY) === 'true') return;

    const sessionCount = parseInt(sessionStorage.getItem(SS_COUNT_KEY) || '0', 10);
    if (sessionCount >= MAX_SHOWS_SESSION) return;

    const show = () => {
      if (triggered.current) return;
      triggered.current = true;
      sessionStorage.setItem(SS_COUNT_KEY, String(sessionCount + 1));
      setVisible(true);
    };

    // Declare with let so checkScroll can reference it without TDZ error
    let fallbackTimer;

    const checkScroll = () => {
      if (triggered.current) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct   = total <= 0 ? 100 : (window.scrollY / total) * 100;
      if (pct >= SCROLL_THRESHOLD) {
        show();
        window.removeEventListener('scroll', checkScroll);
        clearTimeout(fallbackTimer);
      }
    };

    // Check immediately in case already scrolled / page is short
    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });

    // Fallback: show after 5s if user never scrolls 25%
    fallbackTimer = setTimeout(show, 5000);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      clearTimeout(fallbackTimer);
    };
  }, [leadFormEnabled]);

  const close = () => {
    setVisible(false);
    triggered.current = false; // allow re-show up to max count
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.phone.trim()) { setError('Phone number is required.'); return; }
    if (!/^\d{10}$/.test(form.phone.trim())) { setError('Please enter a correct phone number (10 digits).'); return; }
    if (form.interested_country === 'other' && !form.other_country.trim()) {
      setError('Please specify the country name.'); return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.interested_country !== 'other') delete payload.other_country;
      await leadsService.submit(payload);
      localStorage.setItem(LS_SUBMITTED_KEY, 'true');
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.values(data).flat().join(' ');
        setError(msgs || 'Something went wrong. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  const inp = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition placeholder:text-gray-400 bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={close} />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh]">

        {/* Close */}
        <button
          onClick={close}
          className="absolute top-3.5 right-3.5 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition"
        >
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {submitted ? (
          /* ── Success ── */
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-1">
              <svg width="28" height="28" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-lg font-bold text-slate-900">Thanks! We'll be in touch.</p>
            <p className="text-sm text-slate-500">Our team will reach out to help with your study abroad journey.</p>
            <button
              onClick={close}
              className="mt-4 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* ── Header: title then logo right after ── */}
            <div className="px-5 pt-5 pb-4 pr-10 border-b border-gray-100">
              <div className="flex items-end gap-2 flex-wrap">
                <p className="text-[15px] font-extrabold text-slate-900 leading-snug">
                  {leadFormTitle || 'Planning to Study Abroad?'}
                </p>
                {leadFormImage && (
                  <div className="relative shrink-0 h-7 w-16 mb-0.5">
                    <Image
                      src={leadFormImage}
                      alt="Logo"
                      fill
                      className="object-contain object-left-bottom"
                      sizes="64px"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── Scrollable form ── */}
            <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-2.5 flex-1">
              <input
                name="name" value={form.name} onChange={handleChange}
                placeholder="Your Full Name *"
                className={inp} required
              />
              <input
                name="phone" value={form.phone} onChange={handleChange}
                placeholder="Your Phone Number *"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className={inp}
                required
              />
              <input
                name="email" value={form.email} onChange={handleChange}
                placeholder="Your Email Address"
                type="email"
                className={inp}
              />
              <input
                name="district" value={form.district} onChange={handleChange}
                placeholder="Your District"
                className={inp}
              />
              <select
                name="interested_country"
                value={form.interested_country}
                onChange={handleChange}
                className={`${inp} text-gray-700`}
              >
                <option value="" disabled>Interested Country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {form.interested_country === 'other' && (
                <input
                  name="other_country" value={form.other_country} onChange={handleChange}
                  placeholder="Please specify country *"
                  className={inp}
                  autoFocus
                />
              )}
              <textarea
                name="message" value={form.message} onChange={handleChange}
                placeholder="Additional message (optional)"
                rows={2}
                className={`${inp} resize-none`}
              />

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#1CA3FD] hover:bg-[#0e8fe0] disabled:opacity-60 text-white text-sm font-bold py-3 rounded-xl transition"
              >
                {saving ? 'Submitting…' : 'Register'}
              </button>

              <div className="pb-safe" />
            </form>
          </>
        )}
      </div>
    </div>
  );
}
