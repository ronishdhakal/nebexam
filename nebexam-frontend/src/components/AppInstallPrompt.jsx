'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';

export default function AppInstallPrompt() {
  const { isAuthenticated } = useAuth();
  const [show, setShow]     = useState(false);
  const [prompt, setPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Only on Android
    const isAndroid = /android/i.test(navigator.userAgent);
    if (!isAndroid) return;

    // Already running as installed PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && navigator.standalone);
    if (isStandalone) return;

    // Already dismissed this session
    if (sessionStorage.getItem('app_install_dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setShow(false);
      setPrompt(null);
    });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isAuthenticated]);

  const dismiss = () => {
    sessionStorage.setItem('app_install_dismissed', '1');
    setShow(false);
  };

  const install = async () => {
    if (!prompt) return;
    setInstalling(true);
    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/app-install/`,
          { method: 'POST' }
        ).catch(() => {});
        setShow(false);
        setPrompt(null);
      }
    } finally {
      setInstalling(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Dismiss"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#1CA3FD]/10 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#1CA3FD">
            <path d="M6.18 15.64a2.18 2.18 0 0 1-2.18 2.18C2.98 17.82 2 16.84 2 15.64V8.36a2.18 2.18 0 0 1 4.36 0v7.28zm11.64 0a2.18 2.18 0 0 1-4.36 0V8.36a2.18 2.18 0 0 1 4.36 0v7.28zM7.27 2.29l-.9-1.6a.26.26 0 0 1 .45-.26l.91 1.6a5.65 5.65 0 0 1 8.54 0l.91-1.6a.26.26 0 1 1 .45.26l-.9 1.6A5.6 5.6 0 0 1 19.6 6.5H4.4a5.6 5.6 0 0 1 2.87-4.21zm3.1 2.44a.56.56 0 1 0 1.12 0 .56.56 0 0 0-1.12 0zm3.18 0a.56.56 0 1 0 1.12 0 .56.56 0 0 0-1.12 0zM4.4 7.5h15.2v9.5a1.5 1.5 0 0 1-1.5 1.5h-1v2.5a2 2 0 0 1-4 0V18.5h-2v2.5a2 2 0 0 1-4 0V18.5h-1a1.5 1.5 0 0 1-1.5-1.5V7.5h.8z"/>
          </svg>
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Install NEB Exam App</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Get faster access, offline support, and a better experience by installing the app on your Android device.
        </p>

        <div className="flex gap-3">
          <button
            onClick={dismiss}
            className="flex-1 border border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            Not now
          </button>
          <button
            onClick={install}
            disabled={installing}
            className="flex-1 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {installing ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : null}
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
