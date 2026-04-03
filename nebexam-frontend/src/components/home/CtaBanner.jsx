import Link from 'next/link';

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function CtaBanner() {
  return (
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
  );
}
