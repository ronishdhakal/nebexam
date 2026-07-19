import './globals.css';
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari } from 'next/font/google';
import ThemeProvider from '@/components/ThemeProvider';
import ConfigLoader from '@/components/ConfigLoader';
import PopupAd from '@/components/PopupAd';
import AdSenseLoader from '@/components/AdSenseLoader';
import Script from 'next/script';
import { SITE_URL } from '@/lib/siteUrl';
import { configService } from '@/services/users.service';

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

const DEFAULT_TITLE = 'NEB Exam — NEB Exam Preparation Platform';
const DEFAULT_DESCRIPTION = 'Notes, past papers, model questions and chapter resources for NEB — Class 10, 11 and 12.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: '/' },
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/icon.png',
    shortcut: '/assets/icon.png',
    apple: '/assets/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NP',
    siteName: 'NEB Exam',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

async function getOrganizationJsonLd() {
  let sameAs = [];
  try {
    const res = await configService.getSiteSettings();
    sameAs = [res.data?.social_facebook, res.data?.social_instagram].filter(Boolean);
  } catch {}

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NEB Exam',
    url: SITE_URL,
    logo: `${SITE_URL}/assets/icon.png`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NEB Exam',
  url: SITE_URL,
};

export default async function RootLayout({ children }) {
  const organizationJsonLd = await getOrganizationJsonLd();

  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${devanagari.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

        {/* ✅ Google AdSense — hidden for paid subscribers (see AdSenseLoader) */}
        <AdSenseLoader />

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