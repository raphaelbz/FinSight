"use client"

import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="pt-40 pb-32 px-4 text-center relative bg-white">
      <div className="max-w-4xl mx-auto">        
        <h1 className="text-6xl md:text-8xl font-bold font-poppins mb-8 text-gray-900 leading-tight tracking-tight scroll-fade-in">
          Prenez le contrôle de vos{' '}
          <span className="text-blue-600">
            finances
          </span>
        </h1>
        
        <p className="text-2xl md:text-3xl text-gray-500 max-w-3xl mx-auto mb-8 font-poppins font-light leading-relaxed scroll-fade-in">
          L'intelligence artificielle qui optimise automatiquement votre épargne, investissements et budget personnel.
        </p>
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 justify-center items-center mb-16 text-gray-400 font-poppins scroll-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>+2 847€ économisés en moyenne</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>15 000+ utilisateurs actifs</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>4.9/5 de satisfaction client</span>
          </div>
        </div>
        
                <div className="flex flex-col gap-8 justify-center items-center mb-16 scroll-scale">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 text-xl font-poppins font-medium transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/25 rounded-2xl relative overflow-hidden group">
            <span className="relative z-10">Commencer gratuitement</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </Button>
          
          <p className="text-gray-400 text-lg font-poppins font-light">
            Essai gratuit 14 jours • Sans carte bancaire • Configuration en 2 minutes
          </p>
        </div>


        
        </div>
      </section>
  )
} 