import Link from 'next/link';

const CLASSES = [
  { level: '10', label: 'Class 10', desc: 'SEE Preparation' },
  { level: '11', label: 'Class 11', desc: 'Grade 11 Materials' },
  { level: '12', label: 'Class 12', desc: 'Grade 12 Exam Prep' },
];

export default function QuickBrowse({ currentLevel }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Browse All Classes</h2>
        <p className="text-xs text-slate-400">Pick a class to explore</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CLASSES.map((item) => {
          const isCurrent = currentLevel === item.level;
          return (
            <Link
              key={item.level}
              href={`/class-${item.level}`}
              className={`group relative overflow-hidden rounded-xl p-4 border transition-all ${
                isCurrent
                  ? 'border-[#1CA3FD]/30 bg-[#1CA3FD]/4'
                  : 'border-gray-100 dark:border-slate-700 hover:border-[#1CA3FD]/20 hover:bg-[#1CA3FD]/3'
              }`}
            >
              {/* Top accent */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-[#1CA3FD] transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />

              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold mb-3 transition-colors ${
                isCurrent
                  ? 'bg-[#1CA3FD] text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-[#1CA3FD]/10 group-hover:text-[#1CA3FD]'
              }`}>
                {item.level}
              </div>

              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1CA3FD] transition">
                {item.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>

              {isCurrent && (
                <span className="absolute top-3 right-3 text-[10px] font-bold text-[#1CA3FD] bg-[#1CA3FD]/10 px-1.5 py-0.5 rounded-md">
                  Current
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
