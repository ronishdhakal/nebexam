import './globals.css';
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari } from 'next/font/google';
import ThemeProvider from '@/components/ThemeProvider';
import ConfigLoader from '@/components/ConfigLoader';
import PopupAd from '@/components/PopupAd';
import Script from 'next/script';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nebexam.com'),
  title: 'NEB Exam — NEB Exam Preparation Platform',
  description: 'Notes, past papers, model questions and chapter resources for NEB — Class 10, 11 and 12.',
  keywords: ['NEB exam', 'NEB notes', 'Class 10 notes', 'Class 11 notes', 'Class 12 notes', 'SEE preparation', 'Nepal board exam', 'NEB question bank', 'NEB past papers'],
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/icon.png',
    shortcut: '/assets/icon.png',
    apple: '/assets/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NEB Exam',
    title: 'NEB Exam — NEB Exam Preparation Platform',
    description: 'Notes, past papers, model questions and chapter resources for NEB — Class 10, 11 and 12.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEB Exam — NEB Exam Preparation Platform',
    description: 'Notes, past papers, model questions and chapter resources for NEB — Class 10, 11 and 12.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${devanagari.variable}`}>
      <head>

        {/* ✅ Google AdSense */}
        <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2331292940175826"
          crossOrigin="anonymous"
        />

        {/* ✅ Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-3HYR0QNPZC"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3HYR0QNPZC');
            `,
          }}
        />

        {/* ✅ Service Worker */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />

        {/* ❌ (Optional) Remove this if you care about UX/SEO */}
        <Script
          id="disable-right-click"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener('contextmenu', function(e) { e.preventDefault(); });`,
          }}
        />

      </head>

      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <ConfigLoader />
          <PopupAd />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}