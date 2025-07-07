"use client"

import { Brain, Shield, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function Features() {
  return (
    <section id="features" className="py-32 px-4 relative bg-background">
      <div className="max-w-6xl mx-auto">
        
                 {/* Feature 1 - IA Intelligence */}
         <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
           <div className="scroll-fade-in">
             <Brain className="h-16 w-16 text-blue-600 mb-8" />
             <h2 className="text-5xl md:text-6xl font-bold font-poppins text-foreground mb-6 leading-tight">
               Intelligence artificielle
             </h2>
             <p className="text-2xl text-muted-foreground font-poppins font-light leading-relaxed mb-8">
               Notre algorithme d'IA analyse plus de 200 variables financières pour identifier automatiquement vos opportunités d'économies et d'investissement.
             </p>
             <div className="space-y-4">
               <div className="flex items-center text-muted-foreground scroll-fade-in scroll-stagger-1">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Détection automatique des abonnements oubliés</span>
               </div>
               <div className="flex items-center text-muted-foreground scroll-fade-in scroll-stagger-2">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Optimisation fiscale personnalisée (PEA, assurance-vie)</span>
               </div>
               <div className="flex items-center text-muted-foreground scroll-fade-in scroll-stagger-3">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Alertes intelligentes sur les opportunités d'épargne</span>
               </div>
             </div>
           </div>
          <Card className="scroll-fade-in shadow-2xl hover:shadow-3xl transition-all duration-500">
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">€2,847</div>
                  <CardDescription className="mb-4 text-lg">Économies potentielles ce mois</CardDescription>
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                    +23% vs mois dernier
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature 2 - Sécurité */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <Card className="order-2 lg:order-1 scroll-fade-in shadow-2xl hover:shadow-3xl transition-all duration-500">
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-8">
                <CardHeader className="flex flex-row items-center justify-between p-0 mb-6">
                  <Shield className="h-12 w-12 text-emerald-600" />
                  <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                    Niveau bancaire
                  </Badge>
                </CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-foreground font-medium">Chiffrement AES-256</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-foreground font-medium">Conformité PSD2</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-foreground font-medium">Authentification 2FA</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
                     <div className="order-1 lg:order-2 scroll-fade-in">
             <Shield className="h-16 w-16 text-emerald-600 mb-8" />
             <h2 className="text-5xl md:text-6xl font-bold font-poppins text-foreground mb-6 leading-tight">
               Sécurité absolue
             </h2>
             <p className="text-2xl text-muted-foreground font-poppins font-light leading-relaxed mb-8">
               Sécurité bancaire niveau enterprise avec chiffrement AES-256, conformité PSD2 et certifications ISO 27001. Vos identifiants ne sont jamais stockés.
             </p>
             <div className="space-y-4">
               <div className="flex items-center text-muted-foreground scroll-fade-in scroll-stagger-1">
                 <div className="w-2 h-2 bg-emerald-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Agrément ACPR (Autorité de contrôle prudentiel)</span>
               </div>
               <div className="flex items-center text-muted-foreground scroll-fade-in scroll-stagger-2">
                 <div className="w-2 h-2 bg-emerald-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Hébergement France avec certification HDS</span>
               </div>
               <div className="flex items-center text-muted-foreground scroll-fade-in scroll-stagger-3">
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
             <h2 className="text-5xl md:text-6xl font-bold font-poppins text-foreground mb-6 leading-tight">
               Croissance mesurable
             </h2>
             <p className="text-2xl text-muted-foreground font-poppins font-light leading-relaxed mb-8">
               Projections patrimoniales personnalisées sur 30 ans avec simulations d'investissement et optimisation fiscale automatique.
             </p>
             <div className="space-y-4">
               <div className="flex items-center text-muted-foreground scroll-fade-in scroll-stagger-1">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Calcul automatique de votre capacité d'épargne optimale</span>
               </div>
               <div className="flex items-center text-muted-foreground scroll-fade-in scroll-stagger-2">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Réallocation intelligente selon les marchés</span>
               </div>
               <div className="flex items-center text-muted-foreground scroll-fade-in scroll-stagger-3">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                 <span className="font-poppins">Objectifs FIRE (retraite anticipée) personnalisés</span>
               </div>
             </div>
           </div>
          <Card className="scroll-fade-in shadow-2xl hover:shadow-3xl transition-all duration-500">
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-8">
                <CardHeader className="text-center p-0 mb-6">
                  <CardTitle className="text-3xl">Projection 5 ans</CardTitle>
                  <CardDescription className="text-lg">Patrimoine estimé</CardDescription>
                </CardHeader>
                <div className="bg-blue-600 h-3 rounded-full mb-6 shadow-lg"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">€187,450</div>
                  <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                    +€52,000 vs aujourd'hui
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
                 </div>

        {/* Testimonial Section */}
        <div className="pt-32 scroll-fade-in">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-xl text-muted-foreground font-poppins font-light mb-16">
              Utilisé par plus de 15 000 Français pour optimiser leurs finances
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <Card className="text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl scroll-fade-in scroll-stagger-1 border-blue-100 dark:border-blue-900/20">
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-blue-600 mb-3">€4,250</div>
                  <Badge variant="secondary" className="mb-4 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                    économisés en 6 mois
                  </Badge>
                  <CardDescription className="text-sm italic mb-4 leading-relaxed">
                    "FinSight a identifié mes dépenses cachées et optimisé mon épargne."
                  </CardDescription>
                  <Separator className="my-4" />
                  <div className="text-muted-foreground/80 font-poppins text-xs">Marie, 34 ans, Paris</div>
                </CardContent>
              </Card>
              
              <Card className="text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl scroll-fade-in scroll-stagger-2 border-emerald-100 dark:border-emerald-900/20">
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-emerald-600 mb-3">+18%</div>
                  <Badge variant="secondary" className="mb-4 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200">
                    de rendement annuel
                  </Badge>
                  <CardDescription className="text-sm italic mb-4 leading-relaxed">
                    "L'IA m'a conseillé un portefeuille d'investissement personnalisé parfait."
                  </CardDescription>
                  <Separator className="my-4" />
                  <div className="text-muted-foreground/80 font-poppins text-xs">Thomas, 29 ans, Lyon</div>
                </CardContent>
              </Card>
              
              <Card className="text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl scroll-fade-in scroll-stagger-3 border-purple-100 dark:border-purple-900/20">
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-purple-600 mb-3">-65%</div>
                  <Badge variant="secondary" className="mb-4 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                    de stress financier
                  </Badge>
                  <CardDescription className="text-sm italic mb-4 leading-relaxed">
                    "Je comprends enfin mes finances et je dors mieux la nuit."
                  </CardDescription>
                  <Separator className="my-4" />
                  <div className="text-muted-foreground/80 font-poppins text-xs">Sophie, 42 ans, Bordeaux</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Why Now Section */}
        <div className="pt-16 scroll-fade-in">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold font-poppins text-foreground mb-8 leading-tight">
              Pourquoi commencer{' '}
              <span className="text-blue-600">aujourd'hui</span> ?
            </h2>
            <p className="text-xl text-muted-foreground font-poppins font-light leading-relaxed mb-16">
              Chaque jour sans optimisation financière vous coûte en moyenne 7,80€ d'opportunités manquées.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12 text-left">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground font-poppins mb-2">L'inflation erode votre épargne</h3>
                    <p className="text-muted-foreground font-poppins">Avec 5,2% d'inflation, votre argent dort et perd 520€ par an sur 10 000€.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground font-poppins mb-2">Les taux d'intérêt remontent</h3>
                    <p className="text-muted-foreground font-poppins">Opportunité unique : les rendements obligataires atteignent 4% pour la première fois depuis 15 ans.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground font-poppins mb-2">Avantage du premier investisseur</h3>
                    <p className="text-muted-foreground font-poppins">Commencer 5 ans plus tôt = 40% de patrimoine en plus à la retraite grâce aux intérêts composés.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground font-poppins mb-2">L'IA financière accessible</h3>
                    <p className="text-muted-foreground font-poppins">Technologie réservée aux gérants de fortune, maintenant accessible à tous pour 9€/mois.</p>
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