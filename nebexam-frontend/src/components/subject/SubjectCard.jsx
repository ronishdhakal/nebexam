import Link from 'next/link';
import { subjectPath } from '@/lib/urls';

const STREAM_PILL = {
  science:    'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  management: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
};

const LEVEL_ACCENT = { '10': '#f59e0b', '11': '#8b5cf6', '12': '#1CA3FD' };
const LEVEL_BG     = { '10': 'bg-amber-50 dark:bg-amber-950/20', '11': 'bg-violet-50 dark:bg-violet-950/20', '12': 'bg-[#EEF6FF] dark:bg-[#1CA3FD]/5' };

export default function SubjectCard({ subject }) {
  const accent = LEVEL_ACCENT[subject.class_level] || '#1CA3FD';
  const levelBg = LEVEL_BG[subject.class_level] || LEVEL_BG['12'];

  return (
    <Link
      href={subjectPath(subject) ?? `/subject/${subject.slug}`}
      className="group block bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-transparent hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-200 overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className={`w-10 h-10 rounded-xl ${levelBg} flex items-center justify-center shrink-0`}>
            <svg width="18" height="18" fill="none" stroke={accent} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-2 py-0.5 rounded-md mt-0.5">
            {subject.subject_code}
          </span>
        </div>

        {/* Subject name */}
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1CA3FD] transition-colors leading-snug mb-3">
          {subject.name}
        </h3>

        {/* Stream badges */}
        {subject.streams?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {subject.streams.map((s) => (
              <span key={s} className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize tracking-wide ${STREAM_PILL[s] || 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-700/50">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Class {subject.class_level}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1CA3FD] group-hover:gap-2 transition-all">
            Study now
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
