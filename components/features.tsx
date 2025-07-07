"use client"

import { Brain, Shield, TrendingUp } from "lucide-react"

export default function Features() {
  return (
    <section id="features" className="py-32 px-4 relative bg-white">
      <div className="max-w-6xl mx-auto">
        
                 {/* Feature 1 - IA Intelligence */}
         <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
           <div className="scroll-fade-in">
             <Brain className="h-16 w-16 text-blue-600 mb-8" />
             <h2 className="text-5xl md:text-6xl font-bold font-poppins text-gray-900 mb-6 leading-tight">
               Intelligence artificielle
             </h2>
             <p className="text-2xl text-gray-500 font-poppins font-light leading-relaxed mb-8">
               Notre algorithme d'IA analyse plus de 200 variables financières pour identifier automatiquement vos opportunités d'économies et d'investissement.
             </p>
             <div className="space-y-4">
               <div className="flex items-center text-gray-600 scroll-fade-in scroll-stagger-1">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Détection automatique des abonnements oubliés</span>
               </div>
               <div className="flex items-center text-gray-600 scroll-fade-in scroll-stagger-2">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Optimisation fiscale personnalisée (PEA, assurance-vie)</span>
               </div>
               <div className="flex items-center text-gray-600 scroll-fade-in scroll-stagger-3">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Alertes intelligentes sur les opportunités d'épargne</span>
               </div>
             </div>
           </div>
          <div className="scroll-fade-in bg-white rounded-3xl p-12 shadow-xl">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">€2,847</div>
                <div className="text-gray-600 mb-4">Économies potentielles ce mois</div>
                <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-full inline-block">
                  +23% vs mois dernier
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 - Sécurité */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="order-2 lg:order-1 scroll-fade-in bg-white rounded-3xl p-12 shadow-xl">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <Shield className="h-12 w-12 text-emerald-600" />
                <div className="text-emerald-600 font-semibold">Niveau bancaire</div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Chiffrement AES-256</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Conformité PSD2</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Authentification 2FA</span>
                </div>
              </div>
            </div>
          </div>
                     <div className="order-1 lg:order-2 scroll-fade-in">
             <Shield className="h-16 w-16 text-emerald-600 mb-8" />
             <h2 className="text-5xl md:text-6xl font-bold font-poppins text-gray-900 mb-6 leading-tight">
               Sécurité absolue
             </h2>
             <p className="text-2xl text-gray-500 font-poppins font-light leading-relaxed mb-8">
               Sécurité bancaire niveau enterprise avec chiffrement AES-256, conformité PSD2 et certifications ISO 27001. Vos identifiants ne sont jamais stockés.
             </p>
             <div className="space-y-4">
               <div className="flex items-center text-gray-600 scroll-fade-in scroll-stagger-1">
                 <div className="w-2 h-2 bg-emerald-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Agrément ACPR (Autorité de contrôle prudentiel)</span>
               </div>
               <div className="flex items-center text-gray-600 scroll-fade-in scroll-stagger-2">
                 <div className="w-2 h-2 bg-emerald-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Hébergement France avec certification HDS</span>
               </div>
               <div className="flex items-center text-gray-600 scroll-fade-in scroll-stagger-3">
                 <div className="w-2 h-2 bg-emerald-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Authentification forte (biométrie + SMS)</span>
               </div>
             </div>
           </div>
        </div>

        {/* Feature 3 - Croissance */}
        <div className="grid lg:grid-cols-2 gap-20 items-center">
                     <div className="scroll-fade-in">
             <TrendingUp className="h-16 w-16 text-blue-600 mb-8" />
             <h2 className="text-5xl md:text-6xl font-bold font-poppins text-gray-900 mb-6 leading-tight">
               Croissance mesurable
             </h2>
             <p className="text-2xl text-gray-500 font-poppins font-light leading-relaxed mb-8">
               Projections patrimoniales personnalisées sur 30 ans avec simulations d'investissement et optimisation fiscale automatique.
             </p>
             <div className="space-y-4">
               <div className="flex items-center text-gray-600 scroll-fade-in scroll-stagger-1">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Calcul automatique de votre capacité d'épargne optimale</span>
               </div>
               <div className="flex items-center text-gray-600 scroll-fade-in scroll-stagger-2">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Réallocation intelligente selon les marchés</span>
               </div>
               <div className="flex items-center text-gray-600 scroll-fade-in scroll-stagger-3">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Objectifs FIRE (retraite anticipée) personnalisés</span>
               </div>
             </div>
           </div>
          <div className="scroll-fade-in bg-white rounded-3xl p-12 shadow-xl">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">Projection 5 ans</div>
                <div className="text-gray-600">Patrimoine estimé</div>
              </div>
              <div className="bg-blue-600 h-2 rounded-full mb-4"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">€187,450</div>
                <div className="text-gray-600 text-sm">+€52,000 vs aujourd'hui</div>
              </div>
            </div>
          </div>
                 </div>

        {/* Testimonial Section */}
        <div className="pt-32 scroll-fade-in">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-xl text-gray-500 font-poppins font-light mb-16">
              Utilisé par plus de 15 000 Français pour optimiser leurs finances
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="bg-gray-50 rounded-3xl p-8 text-center transition-all duration-500 hover:scale-105 hover:shadow-xl scroll-fade-in scroll-stagger-1">
                <div className="text-3xl font-bold text-blue-600 mb-2">€4,250</div>
                <div className="text-gray-600 font-poppins text-sm mb-3">économisés en 6 mois</div>
                <div className="text-gray-500 font-poppins text-sm italic mb-4">
                  "FinSight a identifié mes dépenses cachées et optimisé mon épargne."
                </div>
                <div className="text-gray-400 font-poppins text-xs">Marie, 34 ans, Paris</div>
              </div>
              
              <div className="bg-gray-50 rounded-3xl p-8 text-center transition-all duration-500 hover:scale-105 hover:shadow-xl scroll-fade-in scroll-stagger-2">
                <div className="text-3xl font-bold text-emerald-600 mb-2">+18%</div>
                <div className="text-gray-600 font-poppins text-sm mb-3">de rendement annuel</div>
                <div className="text-gray-500 font-poppins text-sm italic mb-4">
                  "L'IA m'a conseillé un portefeuille d'investissement personnalisé parfait."
                </div>
                <div className="text-gray-400 font-poppins text-xs">Thomas, 29 ans, Lyon</div>
              </div>
              
              <div className="bg-gray-50 rounded-3xl p-8 text-center transition-all duration-500 hover:scale-105 hover:shadow-xl scroll-fade-in scroll-stagger-3">
                <div className="text-3xl font-bold text-purple-600 mb-2">-65%</div>
                <div className="text-gray-600 font-poppins text-sm mb-3">de stress financier</div>
                <div className="text-gray-500 font-poppins text-sm italic mb-4">
                  "Je comprends enfin mes finances et je dors mieux la nuit."
                </div>
                <div className="text-gray-400 font-poppins text-xs">Sophie, 42 ans, Bordeaux</div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Now Section */}
        <div className="pt-16 scroll-fade-in">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 mb-8 leading-tight">
              Pourquoi commencer{' '}
              <span className="text-blue-600">aujourd'hui</span> ?
            </h2>
            <p className="text-xl text-gray-500 font-poppins font-light leading-relaxed mb-16">
              Chaque jour sans optimisation financière vous coûte en moyenne 7,80€ d'opportunités manquées.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12 text-left">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-poppins mb-2">L'inflation erode votre épargne</h3>
                    <p className="text-gray-600 font-poppins">Avec 5,2% d'inflation, votre argent dort et perd 520€ par an sur 10 000€.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-poppins mb-2">Les taux d'intérêt remontent</h3>
                    <p className="text-gray-600 font-poppins">Opportunité unique : les rendements obligataires atteignent 4% pour la première fois depuis 15 ans.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-poppins mb-2">Avantage du premier investisseur</h3>
                    <p className="text-gray-600 font-poppins">Commencer 5 ans plus tôt = 40% de patrimoine en plus à la retraite grâce aux intérêts composés.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-poppins mb-2">L'IA financière accessible</h3>
                    <p className="text-gray-600 font-poppins">Technologie réservée aux gérants de fortune, maintenant accessible à tous pour 9€/mois.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
} 