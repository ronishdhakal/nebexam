const STATS = [
  { value: '3 Classes', label: 'Class 10, 11 & 12' },
  { value: '50+',       label: 'Subjects covered' },
  { value: '500+',      label: 'Question papers' },
  { value: 'Free',      label: 'Always free to start' },
];

export default function StatsBar() {
  return (
    <section className="border-y border-gray-100 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-100 dark:divide-slate-800">
          {STATS.map((s) => (
            <div key={s.label} className="text-center px-4 py-3">
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
