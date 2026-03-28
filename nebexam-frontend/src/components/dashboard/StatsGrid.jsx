import Link from 'next/link';

function StatCard({ icon, label, value, sub, href }) {
  const inner = (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 ${href ? 'hover:border-[#1CA3FD]/30 hover:shadow-md transition-all group' : ''}`}>
      <div className="w-10 h-10 rounded-xl bg-[#1CA3FD]/8 flex items-center justify-center mb-4 text-[#1CA3FD]">
        {icon}
      </div>
      <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums leading-none mb-1">
        {value !== undefined && value !== null ? (
          value
        ) : (
          <span className="inline-block w-14 h-7 bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse" />
        )}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function StatsGrid({ stats, user }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Subjects"
        value={stats?.subjects}
        sub={user?.level ? `Class ${user.level}` : 'All classes'}
        href={user?.level ? `/class-${user.level}` : '/'}
        icon={
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        }
      />
      <StatCard
        label="Chapters"
        value={stats?.chapters}
        sub="Study chapters"
        icon={
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        }
      />
      <StatCard
        label="Question Papers"
        value={stats?.entries}
        sub="Past & model sets"
        icon={
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        }
      />
      <StatCard
        label="Your Class"
        value={user?.level ? `Class ${user.level}` : '—'}
        sub={user?.level ? 'Study level' : 'Set in profile'}
        icon={
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        }
      />
    </div>
  );
}
