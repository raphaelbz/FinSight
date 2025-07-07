import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import ScrollAnimations from '@/components/scroll-animations'
import Providers from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ThemeSwitch } from '@/components/ui/theme-switch'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'FinSight - Intelligence Artificielle pour vos Finances | Épargne & Investissement',
  description: 'Optimisez automatiquement votre épargne et investissements avec l\'IA. Gestion financière personnelle, conseil patrimonial intelligent, sécurité bancaire. Essai gratuit 14 jours.',
  keywords: [
    'intelligence artificielle finance', 'IA financière', 'gestion patrimoine', 'conseil financier automatique',
    'optimisation épargne', 'investissement personnel', 'budget intelligent', 'application finance',
    'PEA', 'assurance vie', 'livret A', 'économies automatiques', 'retraite anticipée', 'FIRE',
    'agrégateur bancaire', 'PSD2', 'sécurité financière', 'conseiller robo', 'fintech française'
  ],
  openGraph: {
    title: 'FinSight - L\'IA qui optimise vos finances',
    description: 'Économisez automatiquement +2847€ par an grâce à l\'intelligence artificielle. Sécurité bancaire, conseils personnalisés.',
    url: 'https://finsight.fr',
    siteName: 'FinSight',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinSight - L\'IA qui optimise vos finances',
    description: 'Économisez automatiquement +2847€ par an grâce à l\'intelligence artificielle.',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} ${poppins.variable}`}>
        <ThemeProvider>
          <Providers>
            {children}
            <ScrollAnimations />
            
            {/* Theme switch fixed in top right */}
            <div className="fixed top-6 right-6 z-[60]">
              <ThemeSwitch />
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
} 