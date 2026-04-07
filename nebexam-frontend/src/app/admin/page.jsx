'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

function StatCard({ label, value, sub, color, icon, href }) {
  const inner = (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all group ${href ? 'cursor-pointer hover:border-[#1CA3FD]/30' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {href && (
          <span className="text-[10px] font-semibold text-gray-400 group-hover:text-[#1CA3FD] uppercase tracking-wider transition-colors">
            View →
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 tabular-nums">
        {value ?? <span className="text-slate-300 text-2xl">—</span>}
      </div>
      <div className="text-sm font-medium text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function QuickAction({ href, label, icon, color }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-[#1CA3FD]/40 hover:bg-[#1CA3FD]/5 transition-all group"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-700 group-hover:text-[#1CA3FD] transition-colors">{label}</span>
      <span className="ml-auto text-slate-300 group-hover:text-[#1CA3FD] transition-colors">→</span>
    </Link>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/content/subjects/'),
      api.get('/content/areas/'),
      api.get('/content/chapters/'),
      api.get('/questionbank/entries/'),
      api.get('/users/all/', { params: { page_size: 1 } }),
      api.get('/users/all/', { params: { page_size: 1, tier: '1month' } }),
      api.get('/users/all/', { params: { page_size: 1, tier: '3month' } }),
      api.get('/users/all/', { params: { page_size: 1, tier: '1year' } }),
    ]).then(([subjects, areas, chapters, entries, users, tier1m, tier3m, tier1y]) => {
      const subjectList = subjects.data.results || subjects.data;
      const chapterList = chapters.data.results || chapters.data;
      const entryList   = entries.data.results   || entries.data;
      const areaList    = areas.data.results     || areas.data;

      const publishedChapters = chapterList.filter(c => c.is_published).length;
      const publishedEntries  = entryList.filter(e => e.is_published).length;
      const draftEntries      = entryList.length - publishedEntries;

      const totalUsers = users.data.count ?? (users.data.results || users.data).length;
      const paid1m     = tier1m.data.count ?? 0;
      const paid3m     = tier3m.data.count ?? 0;
      const paid1y     = tier1y.data.count ?? 0;
      const byTier = {
        free:     totalUsers - paid1m - paid3m - paid1y,
        '1month': paid1m,
        '3month': paid3m,
        '1year':  paid1y,
      };

      setStats({
        subjects: subjectList.length,
        areas: areaList.length,
        chapters: chapterList.length,
        publishedChapters,
        entries: entryList.length,
        publishedEntries,
        draftEntries,
        users: totalUsers,
        byTier,
      });
    }).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's what's happening on your platform today.</p>
      </div>

      {/* Primary stats */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={stats?.users}
            sub={stats ? `${(stats.byTier?.['1month'] || 0) + (stats.byTier?.['3month'] || 0) + (stats.byTier?.['1year'] || 0)} paid` : null}
            color="bg-[#1CA3FD]/10 text-[#1CA3FD]"
            href="/admin/users"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
          <StatCard
            label="Subjects"
            value={stats?.subjects}
            sub={stats ? `${stats.areas} areas` : null}
            color="bg-violet-50 text-violet-600"
            href="/admin/subjects"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
          />
          <StatCard
            label="Chapters"
            value={stats?.chapters}
            sub={stats ? `${stats.publishedChapters} published` : null}
            color="bg-emerald-50 text-emerald-600"
            href="/admin/chapters"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
          />
          <StatCard
            label="Question Bank"
            value={stats?.entries}
            sub={stats ? `${stats.publishedEntries} live · ${stats.draftEntries} draft` : null}
            color="bg-orange-50 text-orange-600"
            href="/admin/question-bank"
            icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          />
        </div>
      </div>

      {/* User plan breakdown + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">User Subscriptions</h2>
          {stats ? (
            <div className="space-y-3">
              {[
                { tier: 'free',    label: 'Free',     color: 'bg-slate-200',    textColor: 'text-slate-500' },
                { tier: '1month',  label: '1 Month',  color: 'bg-blue-400',     textColor: 'text-blue-600' },
                { tier: '3month',  label: '3 Months', color: 'bg-[#1CA3FD]',    textColor: 'text-[#1CA3FD]' },
                { tier: '1year',   label: '1 Year',   color: 'bg-violet-500',   textColor: 'text-violet-600' },
              ].map(({ tier, label, color, textColor }) => {
                const count = stats.byTier?.[tier] || 0;
                const pct   = stats.users > 0 ? Math.round((count / stats.users) * 100) : 0;
                return (
                  <div key={tier}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`font-medium capitalize ${textColor}`}>{label}</span>
                      <span className="text-slate-400">{count} users ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickAction
              href="/admin/subjects/new"
              label="Add new subject"
              color="bg-violet-50 text-violet-600"
              icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
            />
            <QuickAction
              href="/admin/chapters/new"
              label="Add new chapter"
              color="bg-emerald-50 text-emerald-600"
              icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
            />
            <QuickAction
              href="/admin/question-bank/new"
              label="New question bank entry"
              color="bg-orange-50 text-orange-600"
              icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
            />
            <QuickAction
              href="/admin/areas/new"
              label="Add new area"
              color="bg-[#1CA3FD]/10 text-[#1CA3FD]"
              icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
            />
          </div>
        </div>
      </div>

      {/* Content status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Content Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Live Chapters',
              value: stats?.publishedChapters,
              total: stats?.chapters,
              color: 'text-emerald-600',
              bg: 'bg-emerald-500',
            },
            {
              label: 'Draft Chapters',
              value: stats?.chapters != null ? stats.chapters - stats.publishedChapters : null,
              total: stats?.chapters,
              color: 'text-amber-600',
              bg: 'bg-amber-400',
            },
            {
              label: 'Live QBank',
              value: stats?.publishedEntries,
              total: stats?.entries,
              color: 'text-[#1CA3FD]',
              bg: 'bg-[#1CA3FD]',
            },
            {
              label: 'Draft QBank',
              value: stats?.draftEntries,
              total: stats?.entries,
              color: 'text-orange-600',
              bg: 'bg-orange-400',
            },
          ].map(({ label, value, total, color, bg }) => {
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return (
              <div key={label} className="space-y-2">
                <div className={`text-2xl font-bold tabular-nums ${color}`}>
                  {value ?? <span className="text-slate-300 text-xl">—</span>}
                </div>
                <div className="text-xs text-slate-500 font-medium">{label}</div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${bg}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[10px] text-slate-400">{pct}% of {total ?? '…'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
