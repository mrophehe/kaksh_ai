import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import 'animate.css';
import 'katex/dist/katex.min.css';
import { ThemeProvider } from '@/lib/hooks/use-theme';
import { I18nProvider } from '@/lib/hooks/use-i18n';
import { Toaster } from '@/components/ui/sonner';
import { ServerProvidersInit } from '@/components/server-providers-init';

const inter = localFont({
  src: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  variable: '--font-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    default: 'KakshAI',
    template: '%s | KakshAI',
  },
  description:
    'Turn any document into an interactive AI classroom — complete with teaching agents, slides, voice, and real-time chat. Powered by ElevenLabs and Firecrawl.',
  keywords: [
    'AI classroom',
    'voice learning',
    'ElevenLabs',
    'Firecrawl',
    'AI teacher',
    'interactive learning',
  ],
  openGraph: {
    title: 'KakshAI — Voice-First AI Classroom',
    description:
      'Turn any document into an interactive AI classroom — complete with teaching agents, slides, voice, and real-time chat. Powered by ElevenLabs + Firecrawl.',
    type: 'website',
    siteName: 'KakshAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KakshAI — Voice-First AI Classroom',
    description:
      'Turn any document into an interactive AI classroom with teaching agents, slides, and voice.',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <I18nProvider>
            <ServerProvidersInit />
            {children}
            <Toaster position="top-center" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
