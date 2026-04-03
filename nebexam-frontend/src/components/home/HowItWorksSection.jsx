const STEPS = [
  { n: '01', title: 'Create a free account',  desc: 'Sign up in under a minute — no credit card required. Instant access from day one.' },
  { n: '02', title: 'Choose your class',       desc: 'Select Class 10, 11 or 12 and browse subjects tailored to your grade and stream.' },
  { n: '03', title: 'Study and score higher',  desc: 'Read notes, practice past questions and attempt model sets to track your readiness.' },
];

export default function HowItWorksSection() {
  return (
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
              i === 0
                ? 'bg-[#1CA3FD] text-white shadow-lg shadow-[#1CA3FD]/25'
                : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-slate-400'
            }`}>
              {step.n}
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">{step.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
