'use client';

import Link from 'next/link';
import Image from 'next/image';
import useAuth from '@/hooks/useAuth';
import LoggedInHome from '@/components/home/LoggedInHome';

/* ── Icon helpers ──────────────────────────────────────────────────────── */
const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ── Feature icons ─────────────────────────────────────────────────────── */
const FEATURES = [
  {
    title: 'Chapter Notes',
    desc: 'Comprehensive chapter-by-chapter notes crafted for fast revision.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    title: 'PDF Resources',
    desc: 'Downloadable PDF notes and reference materials for every subject.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    title: 'Past Questions',
    desc: 'Complete NEB board past questions with structured answers.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    title: 'Model Sets',
    desc: 'Full-length model question sets matching real NEB exam patterns.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
];

const CLASSES = [
  { level: '10', label: 'Class 10', tag: 'SEE', desc: 'SEE preparation with chapter notes, past papers and model sets for all subjects.' },
  { level: '11', label: 'Class 11', tag: 'Grade 11', desc: 'Science and Management stream materials with syllabus, notes and model questions.' },
  { level: '12', label: 'Class 12', tag: 'Grade 12', desc: 'Comprehensive exam prep — old questions, model sets and chapter-level notes.' },
];

const STEPS = [
  { n: '01', title: 'Create a free account', desc: 'Sign up in under a minute — no credit card required. Instant access from day one.' },
  { n: '02', title: 'Choose your class', desc: 'Select Class 10, 11 or 12 and browse subjects tailored to your grade and stream.' },
  { n: '03', title: 'Study and score higher', desc: 'Read notes, practice past questions and attempt model sets to track your readiness.' },
];

/* ════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <LoggedInHome user={user} />;
  }

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#1CA3FD 1px, transparent 1px), linear-gradient(90deg, #1CA3FD 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        {/* Top-right glow */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#1CA3FD]/6 dark:bg-[#1CA3FD]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* ── Left copy ── */}
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-[#1CA3FD]/8 dark:bg-[#1CA3FD]/15 text-[#1CA3FD] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1CA3FD] animate-pulse" />
                Nepal&apos;s NEB Exam Preparation Platform
              </div>

              {/* Headline */}
              <h1 className="text-[2.75rem] md:text-[3.5rem] font-black leading-[1.08] tracking-tight text-slate-900 dark:text-white mb-5">
                Best Platform<br />
                for{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#1CA3FD]">NEB Exam</span>
                  <span className="absolute inset-x-0 bottom-1 h-3 bg-[#1CA3FD]/10 dark:bg-[#1CA3FD]/20 -z-0 rounded" />
                </span>
                <br />
                Preparation
              </h1>

              {/* Sub */}
              <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-[420px]">
                Chapter notes, past questions and model sets for Class 10, 11 &amp; 12 — Science &amp; Management streams, completely free.
              </p>

              {/* Class links */}
              <div className="flex items-center gap-2.5 mb-9 flex-wrap">
                {[
                  { href: '/class-10', label: 'Class 10' },
                  { href: '/class-11', label: 'Class 11' },
                  { href: '/class-12', label: 'Class 12' },
                ].map((p) => (
                  <Link
                    key={p.label}
                    href={p.href}
                    className="text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#1CA3FD] hover:text-[#1CA3FD] hover:bg-[#1CA3FD]/5 transition-all shadow-sm"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#1CA3FD]/30 text-sm"
                >
                  Start Preparing Free <Arrow />
                </Link>
                <Link
                  href="/class-12"
                  className="inline-flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-7 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors text-sm"
                >
                  Browse Subjects
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-5 flex-wrap">
                {[
                  { n: '5,000+', label: 'Students' },
                  { n: '50+',    label: 'Subjects' },
                  { n: '500+',   label: 'Papers' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">{s.n}</span>
                    <span className="text-xs text-slate-400 font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right illustration ── */}
            <div className="hidden lg:flex items-center justify-center">
              <Image
                src="/assets/nebexam_neb_hero_fixed.svg"
                alt="NEB Exam Preparation"
                width={560}
                height={480}
                priority
                className="w-full"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-100 dark:divide-slate-800">
            {[
              { value: '3 Classes', label: 'Class 10, 11 & 12' },
              { value: '50+', label: 'Subjects covered' },
              { value: '500+', label: 'Question papers' },
              { value: 'Free', label: 'Always free to start' },
            ].map((s) => (
              <div key={s.label} className="text-center px-4 py-3">
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-[#1CA3FD] uppercase tracking-widest mb-3">What's included</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Everything You Need in One Place</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            Structured study resources organised by class, subject and chapter — built specifically for Nepal's NEB curriculum.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 hover:border-[#1CA3FD]/25 hover:shadow-lg hover:shadow-[#1CA3FD]/6 transition-all cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-[#1CA3FD]/8 text-[#1CA3FD] flex items-center justify-center mb-5 group-hover:bg-[#1CA3FD] group-hover:text-white transition-colors">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLASSES ────────────────────────────────────────────────────────── */}
      <section className="bg-[#EEF6FF] dark:bg-slate-800/50 border-y border-[#1CA3FD]/10 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#1CA3FD] uppercase tracking-widest mb-3">Choose your level</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Tailored for Every Grade</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-base leading-relaxed">
              Select your class and access subject-specific content aligned with the NEB syllabus.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CLASSES.map((cls) => {
              const isStreamed = cls.level === '11' || cls.level === '12';
              return (
                <div
                  key={cls.level}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-[#1CA3FD]/10 dark:border-slate-700 overflow-hidden hover:border-[#1CA3FD]/40 hover:shadow-xl hover:shadow-[#1CA3FD]/10 transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1CA3FD] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Link href={`/class-${cls.level}`} className="block p-7 pb-4">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#1CA3FD]/10 flex items-center justify-center text-lg font-black text-[#1CA3FD]">
                        {cls.level}
                      </div>
                      <span className="text-[11px] font-bold text-[#1CA3FD] bg-[#1CA3FD]/10 px-2.5 py-1 rounded-lg">{cls.tag}</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-[#1CA3FD] transition-colors">{cls.label}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{cls.desc}</p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1CA3FD]">
                      <span>All subjects</span>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </Link>
                  {isStreamed && (
                    <div className="px-7 pb-5 flex items-center gap-2">
                      <Link
                        href={`/class-${cls.level}/science`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Science
                      </Link>
                      <Link
                        href={`/class-${cls.level}/management`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Management
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-[#1CA3FD] uppercase tracking-widest mb-3">Simple process</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Start Preparing in Minutes</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-base leading-relaxed">
            Getting started is effortless. No setup, no confusion — just open and study.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gray-200 dark:bg-slate-700 z-0" />
          {STEPS.map((step, i) => (
            <div key={step.n} className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black mb-5 shrink-0 ${
                i === 0 ? 'bg-[#1CA3FD] text-white shadow-lg shadow-[#1CA3FD]/25' : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-slate-400'
              }`}>
                {step.n}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20 md:pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-[#1CA3FD] px-8 py-14 md:py-16 text-center">
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, white 0%, transparent 55%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }}
          />
          <div className="relative">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Join thousands of students</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">Ready to Start Preparing?</h2>
            <p className="text-white/80 text-base mb-10 max-w-md mx-auto leading-relaxed">
              Create a free account and get instant access to all study materials for your class.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#1CA3FD] font-bold px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-xl"
              >
                Create Free Account <Arrow />
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white/15 hover:bg-white/25 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/20 transition-colors text-sm"
              >
                Already have an account →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
