"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { memo } from "react"
import Link from "next/link"

const StatsBadge = memo(function StatsBadge({ 
  value, 
  color, 
  ariaLabel 
}: { 
  value: string
  color: string
  ariaLabel: string 
}) {
  return (
    <Badge 
      variant="secondary" 
      className={`flex items-center space-x-2 px-4 py-2 ${color} transition-all duration-300 hover:scale-105`}
      role="img"
      aria-label={ariaLabel}
    >
      <div 
        className={`w-2 h-2 rounded-full animate-pulse`}
        style={{ backgroundColor: `var(--${color.includes('green') ? 'green' : color.includes('blue') ? 'blue' : 'purple'}-500)` }}
        aria-hidden="true"
      />
      <span className="font-medium">{value}</span>
    </Badge>
  )
})

export default function Hero() {
  return (
    <section 
      className="pt-40 pb-32 px-4 text-center relative bg-background min-h-screen flex items-center"
      aria-label="Section principale de présentation"
    >
      <div className="max-w-4xl mx-auto w-full">        
        <header className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold font-poppins mb-8 text-foreground leading-tight tracking-tight scroll-fade-in">
            Prenez le contrôle de vos{' '}
            <span 
              className="text-blue-600 relative"
              aria-label="finances, mot-clé principal"
            >
              finances
              <span 
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full opacity-50"
                aria-hidden="true"
              />
            </span>
          </h1>
        </header>
        
        <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto mb-8 font-poppins font-light leading-relaxed scroll-fade-in">
          L'intelligence artificielle qui optimise automatiquement votre épargne, investissements et budget personnel.
        </p>
        
        {/* Statistics section with semantic markup */}
        <div 
          className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center mb-16 scroll-fade-in"
          role="region"
          aria-label="Statistiques de performance FinSight"
        >
          <StatsBadge
            value="+2 847€ économisés en moyenne"
            color="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
            ariaLabel="Économies moyennes: plus de 2847 euros par utilisateur"
          />
          <StatsBadge
            value="15 000+ utilisateurs actifs"
            color="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
            ariaLabel="Plus de 15000 utilisateurs actifs"
          />
          <StatsBadge
            value="4.9/5 de satisfaction client"
            color="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200"
            ariaLabel="Note de satisfaction: 4.9 sur 5"
          />
        </div>
        
        {/* Call to action section */}
        <div 
          className="flex flex-col gap-8 justify-center items-center mb-16 scroll-scale"
          role="region"
          aria-label="Actions principales"
        >
          <Link href="/dashboard" scroll={false} prefetch={true}>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white px-12 py-5 text-xl font-poppins font-medium transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/25 focus:scale-105 focus:-translate-y-1 focus:shadow-2xl focus:shadow-blue-600/25 rounded-2xl relative overflow-hidden group focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              aria-label="Commencer gratuitement - Accéder au tableau de bord"
            >
              <span className="relative z-10">Commencer gratuitement</span>
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full group-focus:translate-x-full transition-transform duration-700 ease-out"
                aria-hidden="true"
              />
            </Button>
          </Link>
          
          <p 
            className="text-muted-foreground text-lg font-poppins font-light"
            role="note"
            aria-label="Conditions d'essai gratuit"
          >
            Essai gratuit 14 jours • Sans carte bancaire • Configuration en 2 minutes
          </p>
        </div>

        {/* Trust indicators with semantic markup */}
        <div 
          className="flex flex-wrap justify-center items-center gap-8 opacity-70 scroll-fade-in"
          role="region"
          aria-label="Indicateurs de confiance et sécurité"
        >
          <div 
            className="flex items-center space-x-2 text-sm text-muted-foreground"
            role="img"
            aria-label="Sécurisé par chiffrement AES-256"
          >
            <svg 
              className="w-4 h-4" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Chiffrement AES-256</span>
          </div>
          
          <div 
            className="flex items-center space-x-2 text-sm text-muted-foreground"
            role="img"
            aria-label="Conformité PSD2 européenne"
          >
            <svg 
              className="w-4 h-4" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Conformité PSD2</span>
          </div>
          
          <div 
            className="flex items-center space-x-2 text-sm text-muted-foreground"
            role="img"
            aria-label="Hébergement sécurisé en France"
          >
            <svg 
              className="w-4 h-4" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
            <span>Hébergé en France</span>
          </div>
        </div>
      </div>
    </section>
  )
} 