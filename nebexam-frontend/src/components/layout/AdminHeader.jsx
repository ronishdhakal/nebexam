'use client';

import { useState, useEffect, useRef } from 'react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationsDropdown({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  useEffect(() => {
    api.get('/users/all/?ordering=-date_joined&limit=8')
      .then((res) => {
        const list = res.data.results ?? res.data ?? [];
        setUsers(Array.isArray(list) ? list.slice(0, 8) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800">Recent Signups</p>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Latest 8</span>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                <div className="h-2 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : users.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-8">No users yet.</p>
        ) : (
          users.map((u) => {
            const initials = u.name?.[0]?.toUpperCase() ?? '?';
            const tierColor = u.subscription_tier === '1year'
              ? 'bg-violet-100 text-violet-600'
              : u.subscription_tier === '3month'
              ? 'bg-[#1CA3FD]/10 text-[#1CA3FD]'
              : u.subscription_tier === '1month'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-slate-500';
            return (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#1CA3FD]/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#1CA3FD]">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${tierColor}`}>
                    {{'free':'Free','1month':'1M','3month':'3M','1year':'1Y'}[u.subscription_tier] || 'Free'}
                  </span>
                  <p className="text-[9px] text-slate-300 mt-0.5">{timeAgo(u.date_joined)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-50 text-center">
        <a href="/admin/users" className="text-xs font-semibold text-[#1CA3FD] hover:underline">
          View all users →
        </a>
      </div>
    </div>
  );
}

export default function AdminHeader() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'Admin';
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 px-7 h-16 flex items-center justify-between shrink-0">
      {/* Greeting */}
      <div>
        <h2 className="text-lg font-bold text-gray-800">
          {getGreeting()}, {firstName} 👋
        </h2>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <div className="relative ml-1">
          <IconBtn title="Notifications" onClick={() => setShowNotifications((v) => !v)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </IconBtn>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#1CA3FD] rounded-full border-2 border-white pointer-events-none" />
          {showNotifications && (
            <NotificationsDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>
      </div>
    </header>
  );
}

function IconBtn({ children, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
    >
      {children}
    </button>
  );
}
