"use client"

import { Button } from "@/components/ui/button"

export default function CTA() {
  return (
    <section className="py-32 px-4 relative bg-blue-600">
      <div className="max-w-4xl mx-auto text-center text-white relative z-10">
        
        <div className="mb-8 scroll-fade-in">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 rounded-full mb-6">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-blue-100 font-poppins text-sm">Plus de 150 nouveaux utilisateurs cette semaine</span>
          </div>
        </div>

        <h2 className="text-5xl md:text-7xl font-bold font-poppins mb-8 leading-tight tracking-tight scroll-fade-in">
          Commencez dès{' '}
          <span className="text-blue-200">
            aujourd'hui
          </span>
        </h2>
        
        <p className="text-2xl md:text-3xl text-blue-100 mb-12 max-w-3xl mx-auto font-poppins font-light leading-relaxed scroll-fade-in">
          Rejoignez les 15 000+ Français qui optimisent déjà leurs finances avec l'IA.
        </p>
        
        <div className="flex flex-col gap-8 justify-center items-center mb-12 scroll-scale">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-12 py-5 text-xl font-poppins font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20 rounded-2xl">
            Commencer gratuitement
          </Button>
          
          <p className="text-blue-200 text-lg font-poppins font-light">
            Essai gratuit 14 jours • Configuration en 2 minutes • Annulation à tout moment
          </p>
        </div>

        <div className="text-center scroll-fade-in">
          <p className="text-blue-200/80 text-sm font-poppins mb-4">
            Prix de lancement : 9€/mois au lieu de 29€ • Offre limitée
          </p>
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 justify-center items-center text-blue-200/60 text-sm font-poppins">
            <span>✓ Sécurité bancaire</span>
            <span>✓ Support français 7j/7</span>
            <span>✓ Données hébergées en France</span>
          </div>
        </div>

      </div>
    </section>
  )
} 