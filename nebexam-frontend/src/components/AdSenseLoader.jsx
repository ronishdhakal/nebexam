'use client';

import Script from 'next/script';
import useAuthStore from '@/store/authStore';

/**
 * Loads the Google AdSense script only for free / guest users.
 * Paid users (any tier other than 'free') see no AdSense ads.
 * While the user profile is still loading (token present but user not yet
 * fetched), we wait — this prevents a flash of ads for paid users.
 */
export default function AdSenseLoader() {
  const { user, isAuthenticated } = useAuthStore();

  // Token exists but profile not loaded yet — wait before deciding
  if (isAuthenticated && !user) return null;

  // Paid subscriber — suppress all AdSense ads
  if (user?.subscription_tier && user.subscription_tier !== 'free') return null;

  return (
    <Script
      async
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2331292940175826"
      crossOrigin="anonymous"
    />
  );
}
