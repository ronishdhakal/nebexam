import Link from 'next/link';

const CLASSES = [
  { level: '8',  label: 'Class 8',  tag: 'Grade 8',  desc: 'Build a strong foundation with chapter notes and practice questions for all subjects.' },
  { level: '9',  label: 'Class 9',  tag: 'Grade 9',  desc: 'Prepare for SEE with topic-wise notes, model questions and past papers.' },
  { level: '10', label: 'Class 10', tag: 'SEE',      desc: 'SEE preparation with chapter notes, past papers and model sets for all subjects.' },
  { level: '11', label: 'Class 11', tag: 'Grade 11', desc: 'Science and Management stream materials with syllabus, notes and model questions.' },
  { level: '12', label: 'Class 12', tag: 'Grade 12', desc: 'Comprehensive exam prep — old questions, model sets and chapter-level notes.' },
];

function ClassCard({ cls }) {
  const isStreamed = cls.level === '11' || cls.level === '12';
  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-[#1CA3FD]/10 dark:border-slate-700 overflow-hidden hover:border-[#1CA3FD]/40 hover:shadow-xl hover:shadow-[#1CA3FD]/10 transition-all flex flex-col h-full">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1CA3FD] opacity-0 group-hover:opacity-100 transition-opacity" />
      <Link href={`/class-${cls.level}`} className="block p-6 pb-4 flex-1">
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#1CA3FD]/10 flex items-center justify-center text-lg font-black text-[#1CA3FD] shrink-0">
            {cls.level}
          </div>
          <span className="text-[11px] font-bold text-[#1CA3FD] bg-[#1CA3FD]/10 px-2.5 py-1 rounded-lg ml-2 leading-tight">{cls.tag}</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-[#1CA3FD] transition-colors">{cls.label}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{cls.desc}</p>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1CA3FD]">
          <span>All subjects</span>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </Link>
      {isStreamed && (
        <div className="px-6 pb-5 flex flex-wrap items-center gap-2">
          <Link
            href={`/class-${cls.level}/science`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            Science
          </Link>
          <Link
            href={`/class-${cls.level}/management`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Management
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ClassesSection() {
  return (
    <section className="bg-[#EEF6FF] dark:bg-slate-800/50 border-y border-[#1CA3FD]/10 dark:border-slate-700">
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-[#1CA3FD] uppercase tracking-widest mb-3">Choose your level</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Tailored for Every Grade</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-base leading-relaxed">
            Select your class and access subject-specific content aligned with the NEB syllabus.
          </p>
        </div>

        {/* Mobile / tablet  → single unified grid (1 or 2 cols) */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CLASSES.map((cls) => <ClassCard key={cls.level} cls={cls} />)}
        </div>

        {/* Desktop → Row 1: 3 cards  |  Row 2: 2 cards centred */}
        <div className="hidden md:flex flex-col gap-5">
          {/* Row 1 — Class 8, 9, 10 */}
          <div className="grid grid-cols-3 gap-5">
            {CLASSES.slice(0, 3).map((cls) => <ClassCard key={cls.level} cls={cls} />)}
          </div>
          {/* Row 2 — Class 11, 12  (2/3 width, centred) */}
          <div className="grid grid-cols-2 gap-5 w-2/3 mx-auto">
            {CLASSES.slice(3).map((cls) => <ClassCard key={cls.level} cls={cls} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
