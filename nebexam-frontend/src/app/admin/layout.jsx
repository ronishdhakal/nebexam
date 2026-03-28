'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useAuth from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';

export default function AdminLayout({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  useAuth(); // ensures user profile is loaded after refresh
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user && !user.is_staff) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  // Block render until we know the user is staff
  if (!isAuthenticated) return null;
  if (!user) return null; // still loading profile — prevents flash for non-staff
  if (!user.is_staff) return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-7 bg-gray-50 min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
