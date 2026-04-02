import Link from 'next/link';

const CARDS = (stats, user) => [
  {
    label: 'Subjects',
    value: stats?.subjects,
    sub:   user?.level ? `Class ${user.level}` : 'All classes',
    href:  user?.level ? `/class-${user.level}` : '/',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    accent: 'text-[#1CA3FD] bg-[#1CA3FD]/8',
  },
  {
    label: 'Chapters',
    value: stats?.chapters,
    sub:   'Study materials',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    accent: 'text-violet-600 bg-violet-50',
  },
  {
    label: 'Question Papers',
    value: stats?.entries,
    sub:   'Past & model sets',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    accent: 'text-emerald-600 bg-emerald-50',
  },
  {
    label: 'Your Class',
    value: user?.level ? `Class ${user.level}` : '—',
    sub:   user?.stream
      ? user.stream === 'science' ? 'Science stream' : 'Management stream'
      : user?.level ? 'Set stream in profile' : 'Set class in profile',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    accent: 'text-amber-600 bg-amber-50',
  },
];

function StatCard({ icon, label, value, sub, href, accent }) {
  const inner = (
    <div className={`bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-col shadow-sm p-4 flex items-center gap-4 ${
      href ? 'hover:border-[#1CA3FD]/25 hover:shadow-md transition-all cursor-pointer group' : ''
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xl font-extrabold text-slate-900 dark:text-foreground tabular-nums leading-tight">
          {value !== undefined && value !== null ? (
            value
          ) : (
            <span className="inline-block w-10 h-6 bg-gray-100 dark:bg-surface-2 rounded animate-pulse" />
          )}
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-muted mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-muted leading-tight mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function StatsGrid({ stats, user }) {
  const cards = CARDS(stats, user);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => <StatCard key={c.label} {...c} />)}
    </div>
  );
}
