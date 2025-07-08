import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Suspense } from 'react'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://finsight.app'),
  title: {
    default: 'FinSight - Intelligence Financière Avancée',
    template: '%s | FinSight'
  },
  description: 'Plateforme d\'intelligence financière utilisant l\'IA pour analyser vos données bancaires et optimiser votre gestion financière.',
  keywords: [
    'fintech', 'intelligence financière', 'analyse bancaire', 'IA finance',
    'open banking', 'gestion financière', 'insights financiers', 'PFM',
    'personal finance management', 'banque connectée', 'agrégation bancaire'
  ],
  authors: [{ name: 'FinSight Team' }],
  creator: 'FinSight',
  publisher: 'FinSight',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://finsight.app',
    siteName: 'FinSight',
    title: 'FinSight - Intelligence Financière Avancée',
    description: 'Plateforme d\'intelligence financière utilisant l\'IA pour analyser vos données bancaires et optimiser votre gestion financière.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FinSight - Intelligence Financière',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinSight - Intelligence Financière Avancée',
    description: 'Plateforme d\'intelligence financière utilisant l\'IA pour analyser vos données bancaires.',
    images: ['/og-image.jpg'],
    creator: '@finsight_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
  classification: 'Financial Technology',
  alternates: {
    canonical: 'https://finsight.app',
    languages: {
      'fr': 'https://finsight.app/fr',
      'en': 'https://finsight.app/en',
    },
  },
}

// Performance optimizations: Critical CSS inlining and resource hints
const criticalResourceHints = () => (
  <>
    {/* Preconnect to external domains */}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link rel="preconnect" href="https://api.saltedge.com" />
    <link rel="preconnect" href="https://www.revolut.com" />
    
    {/* DNS prefetch for performance */}
    <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    <link rel="dns-prefetch" href="//fonts.gstatic.com" />
    <link rel="dns-prefetch" href="//api.saltedge.com" />
    
    {/* Preload critical assets */}
    <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    
    {/* Module preload for better performance */}
    <link rel="modulepreload" href="/_next/static/chunks/main.js" />
    <link rel="modulepreload" href="/_next/static/chunks/pages/_app.js" />
  </>
)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
        {criticalResourceHints()}
        {/* Critical CSS will be inlined by Next.js automatically */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for above-the-fold content */
            .loading-skeleton {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
            }
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
            /* Prevent layout shift */
            .hero-section { min-height: 60vh; }
            .feature-section { min-height: 40vh; }
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="loading-skeleton h-8 w-32 rounded"></div>
          </div>
        }>
          <Providers>
            <ThemeProvider>
              <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                {children}
              </div>
            </ThemeProvider>
          </Providers>
        </Suspense>
        
        {/* Non-critical scripts loaded after page load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              if ('performance' in window) {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('Page Load Performance:', {
                      loadTime: perfData.loadEventEnd - perfData.fetchStart,
                      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
                      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
                    });
                  }, 0);
                });
              }
              
              // Service Worker registration for PWA
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `
          }}
        />
      </body>
    </html>
  )
} 