export const metadata = {
  title: 'About — NEB Exam',
  description: 'Learn about NEB Exam — Nepal\'s platform for Class 10, 11 and 12 notes, question banks, and past papers.',
  openGraph: {
    title: 'About — NEB Exam',
    description: 'Learn about NEB Exam — Nepal\'s platform for Class 10, 11 and 12 notes, question banks, and past papers.',
  },
};

const FEATURES = [
  {
    title: 'Comprehensive Notes',
    desc: 'Well-structured chapter notes for all NEB subjects — available in rich text and PDF formats.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    title: 'Question Bank',
    desc: 'Thousands of past and model questions organised by chapter — MCQs, short answers, and long answers.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    title: 'Past Papers',
    desc: 'Solved past examination papers to help students understand the pattern and prepare effectively.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    title: 'All NEB Classes',
    desc: 'Covers Class 10 (SEE), Class 11 and Class 12 — both Science and Management streams.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1CA3FD] to-[#0e6abf] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">About us</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">NEB Exam</h1>
          <p className="text-white/70 text-sm max-w-xl">
            A dedicated study platform built for Nepal&apos;s NEB (National Examination Board) students — from Class 10 to Class 12.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-12">

        {/* Mission */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Our Mission</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            NEB Exam was built with one goal: to make quality study materials accessible to every NEB student in Nepal, regardless of their location or resources. We believe every student deserves well-organised notes, comprehensive question banks, and solved past papers to prepare with confidence.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
            Our team works continuously to expand and improve the content — keeping pace with the latest NEB curriculum changes and examination patterns.
          </p>
        </div>

        {/* What we offer */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#1CA3FD]/10 text-[#1CA3FD] flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="bg-[#1CA3FD]/5 dark:bg-[#1CA3FD]/10 border border-[#1CA3FD]/20 rounded-2xl p-6">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-semibold text-[#1CA3FD]">Important:</span> NEB Exam is an independent educational platform and is not officially affiliated with or endorsed by the National Examination Board (NEB) of Nepal. All content is prepared for supplementary study purposes only.
          </p>
        </div>

      </div>
    </div>
  );
}
