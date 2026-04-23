import Link from 'next/link';
import Image from 'next/image';

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function HeroSection() {
  return (
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

          {/* Left copy */}
          <div>
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

            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-[420px]">
              Chapter notes, past questions and model sets for Class 10, 11 &amp; 12 — Science &amp; Management streams, completely free.
            </p>

            {/* Class links */}
            <div className="flex items-center gap-2.5 mb-9 flex-wrap">
              {[
                // { href: '/class-10', label: 'Class 10' },
                // { href: '/class-11', label: 'Class 11' },
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

          {/* Right illustration */}
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
  );
}
