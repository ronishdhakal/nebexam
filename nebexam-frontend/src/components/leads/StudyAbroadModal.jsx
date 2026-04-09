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
  const [visible, setVisible]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const triggered               = useRef(false); // prevent double-trigger per mount

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

  // Scroll-depth trigger: show at 25% scroll, up to 3 times per session
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

    const checkScroll = () => {
      if (triggered.current) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      // If page is too short to scroll, treat as 100%
      const pct = total <= 0 ? 100 : (window.scrollY / total) * 100;
      if (pct >= SCROLL_THRESHOLD) {
        show();
        window.removeEventListener('scroll', checkScroll);
        clearTimeout(fallbackTimer);
      }
    };

    // Check immediately (user might have already scrolled / page is short)
    checkScroll();

    window.addEventListener('scroll', checkScroll, { passive: true });

    // Fallback: show after 12s even if user hasn't scrolled 25%
    const fallbackTimer = setTimeout(show, 12000);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      clearTimeout(fallbackTimer);
    };
  }, [leadFormEnabled]);

  const close = () => {
    setVisible(false);
    // Allow re-trigger on next scroll within same session (up to MAX_SHOWS_SESSION)
    triggered.current = false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
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

  const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition placeholder:text-slate-400 bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

      {/* Modal — full-width sheet on mobile, card on desktop */}
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col">

        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-black/15 hover:bg-black/25 text-white transition"
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
            {/* ── Header: title left, image right ── */}
            <div className="flex items-stretch bg-gradient-to-br from-[#0f3460] to-[#1CA3FD] shrink-0">
              {/* Text side */}
              <div className="flex-1 px-5 py-5 flex flex-col justify-center">
                <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                  {leadFormTitle || 'Planning to Study Abroad?'}
                </h2>
                <p className="text-xs text-white/70 mt-1">Fill in your details — we'll help you get started.</p>
              </div>
              {/* Image side */}
              {leadFormImage && (
                <div className="relative w-28 sm:w-36 shrink-0 self-stretch">
                  <Image
                    src={leadFormImage}
                    alt="Study Abroad"
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>
              )}
            </div>

            {/* ── Scrollable form body ── */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto px-5 py-4 space-y-3 flex-1"
            >
              <input
                name="name" value={form.name} onChange={handleChange}
                placeholder="Your Full Name *"
                className={inp} required
              />
              <input
                name="phone" value={form.phone} onChange={handleChange}
                placeholder="Phone Number"
                type="tel"
                className={inp}
              />
              <input
                name="email" value={form.email} onChange={handleChange}
                placeholder="Email Address"
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
                className={inp}
              >
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
                {saving ? 'Submitting…' : 'Register Now'}
              </button>

              {/* Safe-area padding on mobile */}
              <div className="pb-safe" />
            </form>
          </>
        )}
      </div>
    </div>
  );
}
