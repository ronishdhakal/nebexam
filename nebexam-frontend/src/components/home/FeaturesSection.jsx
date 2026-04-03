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

export default function FeaturesSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
      <div className="text-center mb-14">
        <p className="text-xs font-bold text-[#1CA3FD] uppercase tracking-widest mb-3">What&apos;s included</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Everything You Need in One Place</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
          Structured study resources organised by class, subject and chapter — built specifically for Nepal&apos;s NEB curriculum.
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
  );
}
