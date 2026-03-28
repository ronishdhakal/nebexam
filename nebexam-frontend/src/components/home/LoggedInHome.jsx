'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/users.service';
import { subjectsService } from '@/services/subjects.service';
import SubjectCard from '@/components/subject/SubjectCard';

const LEVELS = ['10', '11', '12'];
const STREAMS = [
  { value: 'science',    label: 'Science',    activeClass: 'bg-blue-500 text-white border-blue-500',    inactiveClass: 'border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400' },
  { value: 'management', label: 'Management', activeClass: 'bg-emerald-500 text-white border-emerald-500', inactiveClass: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400' },
];

export default function LoggedInHome({ user }) {
  const { setUser } = useAuthStore();
  const [level, setLevel]     = useState(user.level || '12');
  const [stream, setStream]   = useState(user.stream || '');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const isStreamed = level === '11' || level === '12';

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = { class_level: level };
      if (isStreamed && stream) params.stream = stream;
      const res = await subjectsService.getAll(params);
      const list = res.data.results ?? res.data;
      setSubjects(Array.isArray(list) ? list : []);
    } catch {
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [level, stream, isStreamed]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const savePreference = async (newLevel, newStream) => {
    setSaving(true);
    try {
      const res = await authService.updateProfile({ level: newLevel, stream: newStream });
      setUser(res.data);
    } catch {
      // silent — local state already updated, preference just didn't persist
    } finally {
      setSaving(false);
    }
  };

  const handleLevelChange = (newLevel) => {
    const newStream = (newLevel === '11' || newLevel === '12') ? stream : '';
    setLevel(newLevel);
    setStream(newStream);
    savePreference(newLevel, newStream);
  };

  const handleStreamChange = (newStream) => {
    const next = stream === newStream ? '' : newStream;
    setStream(next);
    savePreference(level, next);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user.name?.split(' ')[0];

  const streamLabel = stream ? (stream === 'science' ? 'Science' : 'Management') : 'All subjects';
  const browseHref = isStreamed && stream ? `/class-${level}/${stream}` : `/class-${level}`;

  return (
    <div className="bg-white dark:bg-slate-900 min-h-[80vh]">

      {/* ── Personalized header ── */}
      <div className="border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#1CA3FD] uppercase tracking-widest mb-1">
                {saving ? 'Saving…' : 'Your Study Hub'}
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {greeting}, {firstName} 👋
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Class {level} {isStreamed && stream ? `· ${streamLabel}` : ''}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1CA3FD] hover:text-[#0e8fe0] transition-colors"
            >
              Go to Dashboard
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          {/* ── Class + Stream toggles ── */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            {/* Class pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => handleLevelChange(l)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    level === l
                      ? 'bg-[#1CA3FD] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Class {l}
                </button>
              ))}
            </div>

            {/* Stream pills — only for 11/12 */}
            {isStreamed && (
              <div className="flex items-center gap-2">
                {STREAMS.map(({ value, label, activeClass, inactiveClass }) => (
                  <button
                    key={value}
                    onClick={() => handleStreamChange(value)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      stream === value ? activeClass : inactiveClass
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Subjects grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">No subjects found for this selection.</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
              </p>
              <Link href={browseHref} className="text-xs font-semibold text-[#1CA3FD] hover:text-[#0e8fe0] transition-colors">
                Browse all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((s) => <SubjectCard key={s.id} subject={s} />)}
            </div>
          </>
        )}
      </div>

      {/* ── Quick Access ── */}
      <div className="border-t border-gray-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Quick Access</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'Past Papers',
                desc: 'Previous NEB board questions',
                href: browseHref,
                color: 'text-[#1CA3FD]',
                bg: 'bg-[#EEF6FF] dark:bg-[#1CA3FD]/10',
                icon: (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                ),
              },
              {
                label: 'Chapter Notes',
                desc: 'Subject & chapter wise notes',
                href: browseHref,
                color: 'text-violet-600',
                bg: 'bg-violet-50 dark:bg-violet-950/20',
                icon: (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                ),
              },
              {
                label: 'Syllabus',
                desc: 'Official NEB curriculum',
                href: browseHref,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-950/20',
                icon: (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                ),
              },
              {
                label: 'Dashboard',
                desc: 'Your profile & subscription',
                href: '/dashboard',
                color: 'text-amber-600',
                bg: 'bg-amber-50 dark:bg-amber-950/20',
                icon: (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                ),
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-transparent hover:shadow-lg transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1CA3FD] transition-colors">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Study tip strip ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1CA3FD] to-[#0e8fe0] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 10% 50%, white 0%, transparent 55%)' }} />
          <div className="relative">
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Today&apos;s tip</p>
            <p className="text-white font-semibold text-sm leading-snug max-w-md">
              Consistency beats intensity. Even 30 minutes of focused study daily will put you ahead by exam time.
            </p>
          </div>
          <Link
            href={browseHref}
            className="relative shrink-0 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Start Studying
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </div>

    </div>
  );
}
