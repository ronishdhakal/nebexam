'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/users.service';

const sections = [
  {
    label: 'Content',
    links: [
      {
        href: '/admin/subjects',
        label: 'Subjects',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
      },
      {
        href: '/admin/areas',
        label: 'Areas',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
      },
      {
        href: '/admin/chapters',
        label: 'Chapters',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
      },
    ],
  },
  {
    label: 'Exam',
    links: [
      {
        href: '/admin/question-bank',
        label: 'Question Bank',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
      },
    ],
  },
  {
    label: 'Publishing',
    links: [
      {
        href: '/admin/news',
        label: 'News',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>,
      },
      {
        href: '/admin/blog',
        label: 'Blog',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
      },
    ],
  },
  {
    label: 'System',
    links: [
      {
        href: '/admin/users',
        label: 'Users',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      },
      {
        href: '/admin/earnings',
        label: 'Earnings',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      },
      {
        href: '/admin/coupons',
        label: 'Coupons',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
      },
      {
        href: '/admin/referral',
        label: 'Referral',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      },
      {
        href: '/admin/settings',
        label: 'Settings',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
      },
      {
        href: '/admin/bucket',
        label: 'Bucket',
        icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/></svg>,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  // Persist collapsed state in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored === 'true') setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebar-collapsed', String(!prev));
      return !prev;
    });
  };

  const handleLogout = async () => {
    try { await authService.logout(); } finally {
      logout();
      router.push('/auth/login');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-60'} h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col shrink-0 shadow-sm transition-all duration-200`}
    >
      {/* Logo + toggle */}
      <div className={`border-b border-gray-100 shrink-0 flex items-center ${collapsed ? 'justify-center py-5 px-2' : 'justify-between px-5 py-5'}`}>
        {!collapsed && (
          <Link href="/admin">
            <Image
              src="/assets/logo/light-logo.svg"
              alt="NEB Exam"
              width={130}
              height={33}
              priority
            />
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" className="w-8 h-8 rounded-lg bg-[#1CA3FD]/10 flex items-center justify-center">
            <span className="text-sm font-black text-[#1CA3FD]">N</span>
          </Link>
        )}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`text-slate-400 hover:text-slate-600 transition-colors shrink-0 ${collapsed ? 'hidden' : ''}`}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      {/* Dashboard link */}
      <div className={`pt-4 pb-1 shrink-0 ${collapsed ? 'px-2' : 'px-3'}`}>
        <NavLink
          href="/admin"
          label="Dashboard"
          collapsed={collapsed}
          active={pathname === '/admin'}
          icon={
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          }
        />
      </div>

      {/* Toggle button when collapsed — shown below dashboard */}
      {collapsed && (
        <div className="px-2 pb-1 shrink-0">
          <button
            onClick={toggleCollapsed}
            title="Expand sidebar"
            className="w-full flex items-center justify-center py-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-gray-50 transition-all"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      )}

      {/* Sections — scrollable */}
      <nav className={`flex-1 py-2 space-y-5 overflow-y-auto min-h-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${collapsed ? 'px-2' : 'px-3'}`}>
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold text-black uppercase tracking-widest">
                {section.label}
              </p>
            )}
            {collapsed && <div className="h-px bg-gray-100 mx-1 mb-2" />}
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const active = pathname.startsWith(link.href);
                return <NavLink key={link.href} href={link.href} label={link.label} icon={link.icon} active={active} collapsed={collapsed} />;
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile — sticky */}
      <div className="border-t border-gray-100 px-4 py-4 shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1CA3FD]/10 flex items-center justify-center">
              <span className="text-xs font-bold text-[#1CA3FD]">{initials}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-slate-400 hover:text-red-400 transition-colors"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#1CA3FD]/10 flex items-center justify-center">
                <span className="text-xs font-bold text-[#1CA3FD]">{initials}</span>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-black truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-black hover:text-red-400 transition-colors shrink-0"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavLink({ href, label, icon, active, collapsed }) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
        collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'
      } ${
        active
          ? 'bg-[#1CA3FD] text-white shadow-sm shadow-[#1CA3FD]/30'
          : 'text-black hover:bg-gray-50 hover:text-black'
      }`}
    >
      <span className={active ? 'text-white' : 'text-black'}>{icon}</span>
      {!collapsed && label}
    </Link>
  );
}
