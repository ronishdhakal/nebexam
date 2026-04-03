export const metadata = {
  title: 'How to Use NEB Exam — Step-by-Step Guide',
  description: 'Learn how to use NEB Exam to study notes, practise question bank, and access past papers for Class 10, 11 & 12. A step-by-step guide for NEB students.',
};

const STEPS = [
  {
    step: '01',
    title: 'Create a Free Account',
    desc: 'Register with your email address. Choose your class level (10, 11, or 12) and stream. Your account gives you immediate access to class notes and 4 free answer reveals.',
  },
  {
    step: '02',
    title: 'Browse Your Class',
    desc: 'Navigate to your class from the home page. You\'ll see all subjects organised by your stream. Click any subject to explore its chapters.',
  },
  {
    step: '03',
    title: 'Study Notes & PDFs',
    desc: 'Each chapter has rich-text notes you can read directly in your browser. PDF notes can be downloaded for offline study. Free accounts have full access to notes.',
  },
  {
    step: '04',
    title: 'Practice Questions',
    desc: 'Open the Question Bank for any chapter. Questions are grouped by type — MCQ, Short Answer, Long Answer, Passage, and more. Try answering before revealing the solution.',
  },
  {
    step: '05',
    title: 'Upgrade for Full Access',
    desc: 'Free accounts include 4 answer reveals. Upgrade to a paid plan to unlock unlimited answers, all PDF notes, full past papers, and model question sets.',
  },
  {
    step: '06',
    title: 'Track Your Progress',
    desc: 'Your dashboard shows study statistics — time spent per chapter, reveals used, and subscription status. Use this to identify areas that need more focus.',
  },
];

const TIPS = [
  'Use the chapter notes first, then test yourself with the question bank.',
  'The "Most Popular" 3-month plan is great value for exam preparation season.',
  'MCQ questions are great for quick revision; long answers test deeper understanding.',
  'Past papers show the actual exam pattern — prioritise these before exams.',
  'Found a mistake? Use the Contact page to report it — we fix errors quickly.',
];

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1CA3FD] to-[#0e6abf] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Guide</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">How to Use NEB Exam</h1>
          <p className="text-white/70 text-sm max-w-xl">
            Get the most out of your study sessions with this quick guide to all features.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-12">

        {/* Steps */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Step-by-Step Guide</h2>
          <div className="space-y-4">
            {STEPS.map((s) => (
              <div key={s.step} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[#1CA3FD]/10 flex items-center justify-center">
                  <span className="text-xs font-extrabold text-[#1CA3FD] tracking-wider">{s.step}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{s.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-8">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-5">Study Tips</h2>
          <ul className="space-y-3">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <svg className="shrink-0 mt-0.5 text-[#1CA3FD]" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ-style callout */}
        <div className="bg-[#1CA3FD]/5 dark:bg-[#1CA3FD]/10 border border-[#1CA3FD]/20 rounded-2xl p-6">
          <p className="text-sm font-semibold text-[#1CA3FD] mb-2">Still have questions?</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Reach out via the <a href="/contact" className="text-[#1CA3FD] font-medium hover:underline">Contact page</a> and we&apos;ll help you get started.
          </p>
        </div>

      </div>
    </div>
  );
}
