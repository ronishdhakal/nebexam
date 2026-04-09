'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import useAuth from '@/hooks/useAuth';
import ThemeToggle from '@/components/ThemeToggle';

function NavLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const src = mounted && resolvedTheme === 'dark'
    ? '/assets/logo/dark-logo.svg'
    : '/assets/logo/light-logo.svg';
  return <Image src={src} alt="NEB Exam" width={170} height={52} className="h-12 w-auto" />;
}

function usePwaInstall() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setInstalled(true); setPrompt(null); });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setPrompt(null);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/app-install/`, { method: 'POST' }).catch(() => {});
    }
  };

  return { canInstall: !installed && !!prompt, install };
}

// Dropdown for streamed classes (11 & 12)
function ClassDropdown({ level, label, isActive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  const open_ = () => { clearTimeout(timerRef.current); setOpen(true); };
  const close_ = () => { timerRef.current = setTimeout(() => setOpen(false), 120); };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div
      className="relative group"
      onMouseEnter={open_}
      onMouseLeave={close_}
      ref={ref}
    >
      <button
        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[#1CA3FD]/10 text-[#1CA3FD]'
            : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg shadow-black/5 dark:shadow-black/30 overflow-hidden transition-all duration-150 origin-top ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        onMouseEnter={open_}
        onMouseLeave={close_}
      >
        <div className="p-1.5">
          <Link
            href={`/class-${level}/science`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors group/item"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            Science
          </Link>
          <Link
            href={`/class-${level}/management`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors group/item"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            Management
          </Link>
          <div className="border-t border-gray-100 dark:border-slate-700 mt-1 pt-1">
            <Link
              href={`/class-${level}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              All subjects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, handleLogout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const pathname = usePathname();
  const { canInstall, install } = usePwaInstall();

  const onLogout = async () => {
    setMenuOpen(false);
    await handleLogout();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <NavLogo />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {['8', '9', '10'].map((level) => (
              <Link
                key={level}
                href={`/class-${level}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname?.startsWith(`/class-${level}`)
                    ? 'bg-[#1CA3FD]/10 text-[#1CA3FD]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Class {level}
              </Link>
            ))}

            <ClassDropdown level="11" label="Class 11" isActive={pathname?.startsWith('/class-11')} />
            <ClassDropdown level="12" label="Class 12" isActive={pathname?.startsWith('/class-12')} />

            <Link
              href="/news"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname?.startsWith('/news')
                  ? 'bg-[#1CA3FD]/10 text-[#1CA3FD]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              News
            </Link>

            <Link
              href="/blog"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname?.startsWith('/blog')
                  ? 'bg-[#1CA3FD]/10 text-[#1CA3FD]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Blog
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {user?.is_staff ? (
                  <Link href="/admin" className="hidden md:flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-[#1CA3FD] font-medium transition-colors">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Admin
                  </Link>
                ) : (
                  <Link href="/dashboard" className="hidden md:flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-[#1CA3FD] font-medium transition-colors">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Dashboard
                  </Link>
                )}
                <div className="w-8 h-8 rounded-full bg-[#1CA3FD]/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#1CA3FD]">{user?.name?.[0]?.toUpperCase() ?? '…'}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="hidden md:block text-sm text-slate-400 hover:text-red-500 font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="hidden md:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#1CA3FD] transition-colors px-3 py-2">
                  Log in
                </Link>
                <Link href="/auth/register" className="text-sm font-semibold bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-4 py-2 rounded-xl transition-colors shadow-sm shadow-[#1CA3FD]/20">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              {menuOpen
                ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-slate-800 py-3 space-y-0.5">
            {['8', '9', '10'].map((level) => (
              <Link
                key={level}
                href={`/class-${level}`}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Class {level}
              </Link>
            ))}

            {['11', '12'].map((level) => (
              <div key={level}>
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === level ? null : level)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  Class {level}
                  <svg
                    className={`w-4 h-4 transition-transform duration-150 ${mobileExpanded === level ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {mobileExpanded === level && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    <Link
                      href={`/class-${level}/science`}
                      onClick={() => { setMenuOpen(false); setMobileExpanded(null); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-400"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      Science
                    </Link>
                    <Link
                      href={`/class-${level}/management`}
                      onClick={() => { setMenuOpen(false); setMobileExpanded(null); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      Management
                    </Link>
                    <Link
                      href={`/class-${level}`}
                      onClick={() => { setMenuOpen(false); setMobileExpanded(null); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    >
                      All subjects
                    </Link>
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/news"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              News
            </Link>
            <Link
              href="/blog"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Blog
            </Link>

            <div className="border-t border-gray-100 dark:border-slate-800 pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  {user?.is_staff
                    ? <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">Admin</Link>
                    : <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">Dashboard</Link>
                  }
                  <button onClick={onLogout} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">Log in</Link>
                  <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-[#1CA3FD] hover:bg-[#1CA3FD]/5">Get Started</Link>
                </>
              )}

              {/* PWA Install — mobile only, shown only when installable */}
              {canInstall && (
                <button
                  onClick={() => { install(); setMenuOpen(false); }}
                  className="mt-2 w-full flex items-center gap-2.5 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.18 15.64a2.18 2.18 0 0 1-2.18 2.18C2.98 17.82 2 16.84 2 15.64V8.36a2.18 2.18 0 0 1 4.36 0v7.28zm11.64 0a2.18 2.18 0 0 1-4.36 0V8.36a2.18 2.18 0 0 1 4.36 0v7.28zM7.27 2.29l-.9-1.6a.26.26 0 0 1 .45-.26l.91 1.6a5.65 5.65 0 0 1 8.54 0l.91-1.6a.26.26 0 1 1 .45.26l-.9 1.6A5.6 5.6 0 0 1 19.6 6.5H4.4a5.6 5.6 0 0 1 2.87-4.21zm3.1 2.44a.56.56 0 1 0 1.12 0 .56.56 0 0 0-1.12 0zm3.18 0a.56.56 0 1 0 1.12 0 .56.56 0 0 0-1.12 0zM4.4 7.5h15.2v9.5a1.5 1.5 0 0 1-1.5 1.5h-1v2.5a2 2 0 0 1-4 0V18.5h-2v2.5a2 2 0 0 1-4 0V18.5h-1a1.5 1.5 0 0 1-1.5-1.5V7.5h.8z"/>
                  </svg>
                  Install App
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}