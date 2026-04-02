'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import useConfigStore from '@/store/configStore';
import { authService } from '@/services/users.service';
import { subjectsService } from '@/services/subjects.service';
import SubjectCard from '@/components/subject/SubjectCard';
import { mediaUrl } from '@/lib/utils';

// ── helpers ──────────────────────────────────────────────────────────────────

function getDaysLeft(expiresAt) {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / 86400000));
}

const TIER_LABEL = { free: 'Free', '1month': '1 Month', '3month': '3 Months', '1year': '1 Year' };

// ── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[120px] rounded-2xl bg-gray-100 dark:bg-surface-2 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function LoggedInHome({ user }) {
  const { setUser }    = useAuthStore();
  const esewaEnabled   = useConfigStore((s) => s.esewaEnabled);

  const [level, setLevel]       = useState(user.level || '12');
  const [stream, setStream]     = useState(user.stream || '');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const isStreamed = level === '11' || level === '12';
  const isFree     = (user.subscription_tier || 'free') === 'free';
  const daysLeft   = getDaysLeft(user.subscription_expires_at);
  const browseHref = isStreamed && stream ? `/class-${level}/${stream}` : `/class-${level}`;

  const picUrl   = mediaUrl(user.profile_picture);
  const initials = user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ── fetch subjects ──────────────────────────────────────────────────────────
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = { class_level: level };
      if (isStreamed && stream) params.stream = stream;
      const res  = await subjectsService.getAll(params);
      const list = res.data.results ?? res.data;
      setSubjects(Array.isArray(list) ? list : []);
    } catch {
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [level, stream, isStreamed]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  // ── save class/stream preference ───────────────────────────────────────────
  const savePreference = async (newLevel, newStream) => {
    setSaving(true);
    try {
      const res = await authService.updateProfile({ level: newLevel, stream: newStream });
      setUser(res.data);
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  };

  const handleLevel = (l) => {
    const s = (l === '11' || l === '12') ? stream : '';
    setLevel(l); setStream(s);
    savePreference(l, s);
  };

  const handleStream = (s) => {
    const next = stream === s ? '' : s;
    setStream(next);
    savePreference(level, next);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-surface border-b border-gray-100 dark:border-border-col">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 sm:py-8">
          <div className="flex items-start justify-between gap-4">

            {/* Left: greeting + selectors */}
            <div className="flex-1 min-w-0">

              {/* Greeting row */}
              <div className="flex items-center gap-3 mb-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#1CA3FD]/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {picUrl
                    ? <img src={picUrl} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="text-sm font-black text-[#1CA3FD]">{initials}</span>
                  }
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-muted">{greeting}</p>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-foreground leading-tight">
                    {user.name?.split(' ')[0]}
                    {saving && <span className="ml-2 text-xs font-normal text-slate-400 dark:text-muted">saving…</span>}
                  </h1>
                  {esewaEnabled && user.referral_code && (
                    <Link
                      href="/referral-program"
                      className="inline-flex items-center gap-2 mt-1.5 group"
                    >
                      <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 px-2 py-0.5 rounded-lg tracking-wider">
                        {user.referral_code}
                      </span>
                      <span className="hidden sm:inline text-xs text-slate-400 dark:text-muted group-hover:text-violet-500 transition">
                        Invite friends — they get 10% off, you earn 10%
                      </span>
                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-slate-300 group-hover:text-violet-500 transition">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </Link>
                  )}
                </div>
              </div>

              {/* Class + Stream selector */}
              <div className="flex flex-wrap items-center gap-2">

                {/* Class tabs */}
                <div className="flex items-center bg-gray-100 dark:bg-surface-2 rounded-xl p-1 gap-0.5">
                  {['10', '11', '12'].map((l) => (
                    <button
                      key={l}
                      onClick={() => handleLevel(l)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        level === l
                          ? 'bg-white dark:bg-surface text-slate-900 dark:text-foreground shadow-sm'
                          : 'text-slate-400 dark:text-muted hover:text-slate-600 dark:hover:text-foreground'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {/* Stream toggle */}
                {isStreamed && (
                  <div className="flex items-center gap-1.5">
                    {[
                      { value: 'science',    label: 'Science',    on: 'bg-blue-500 text-white',    off: 'bg-white dark:bg-surface text-blue-600 border border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950' },
                      { value: 'management', label: 'Management', on: 'bg-emerald-500 text-white',  off: 'bg-white dark:bg-surface text-emerald-600 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-950' },
                    ].map(({ value, label, on, off }) => (
                      <button
                        key={value}
                        onClick={() => handleStream(value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${stream === value ? on : off}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: plan badge + dashboard link */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* Plan/expiry */}
              {isFree ? (
                <Link
                  href={esewaEnabled ? `/checkout/1month` : '/dashboard'}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#1CA3FD] text-white hover:bg-[#0e8fe0] transition shadow-sm shadow-[#1CA3FD]/20"
                >
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Upgrade Plan
                </Link>
              ) : (
                <div className="text-right">
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                    daysLeft !== null && daysLeft <= 7  ? 'bg-red-50 text-red-600' :
                    daysLeft !== null && daysLeft <= 30 ? 'bg-amber-50 text-amber-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {TIER_LABEL[user.subscription_tier]}
                    {daysLeft !== null && ` · ${daysLeft}d left`}
                  </span>
                </div>
              )}

              <Link
                href="/dashboard"
                className="text-xs font-semibold text-slate-400 dark:text-muted hover:text-[#1CA3FD] transition flex items-center gap-1"
              >
                Dashboard
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SUBJECTS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">

        {/* Section label */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <p className="text-sm font-bold text-slate-800 dark:text-foreground">
              Class {level} Subjects
              {isStreamed && stream && (
                <span className={`ml-1.5 text-xs font-semibold ${stream === 'science' ? 'text-blue-600' : 'text-emerald-600'}`}>
                  · {stream === 'science' ? 'Science' : 'Management'}
                </span>
              )}
            </p>
            {!loading && subjects.length > 0 && (
              <span className="text-xs font-semibold text-slate-400 dark:text-muted bg-white dark:bg-surface border border-gray-100 dark:border-border-col px-2 py-0.5 rounded-lg">
                {subjects.length}
              </span>
            )}
          </div>
          <Link href={browseHref} className="text-xs font-semibold text-[#1CA3FD] hover:text-[#0e8fe0] transition">
            See all →
          </Link>
        </div>

        {loading ? (
          <Skeleton />
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-surface-2 flex items-center justify-center mb-4">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-slate-300 dark:text-muted">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-muted mb-1">No subjects found</p>
            <p className="text-xs text-slate-400 dark:text-muted">Try selecting a different class or stream.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((s) => <SubjectCard key={s.id} subject={s} />)}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          QUICK LINKS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Past Papers',
              desc:  'Board questions',
              href:  browseHref,
              icon:  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
              accent: 'bg-[#1CA3FD]/8 text-[#1CA3FD]',
            },
            {
              label: 'Chapter Notes',
              desc:  'Subject-wise notes',
              href:  browseHref,
              icon:  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
              accent: 'bg-violet-50 text-violet-600',
            },
            {
              label: 'Model Sets',
              desc:  'Full-length practice',
              href:  browseHref,
              icon:  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
              accent: 'bg-emerald-50 text-emerald-600',
            },
            {
              label: 'Dashboard',
              desc:  'Profile & progress',
              href:  '/dashboard',
              icon:  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
              accent: 'bg-amber-50 text-amber-600',
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-col hover:border-gray-200 dark:hover:border-surface-2 hover:shadow-sm p-4 transition-all"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.accent}`}>
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-foreground group-hover:text-[#1CA3FD] transition truncate">{item.label}</p>
                <p className="text-[11px] text-slate-400 dark:text-muted truncate">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
