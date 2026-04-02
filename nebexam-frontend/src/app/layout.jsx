import './globals.css';
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari } from 'next/font/google';
import ThemeProvider from '@/components/ThemeProvider';
import ConfigLoader from '@/components/ConfigLoader';

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
  title: 'NEB Exam — NEB Exam Preparation Platform',
  description: 'Notes, past papers, model questions and chapter resources for NEB — Class 10, 11 and 12.',
  icons: {
    icon: '/assets/icon.png',
    shortcut: '/assets/icon.png',
    apple: '/assets/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${devanagari.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <ConfigLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
