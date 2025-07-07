"use client"

import { TrendingUp } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center relative z-10">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold font-poppins text-blue-600">FinSight</span>
        </div>
        
        <p className="text-xl text-gray-500 font-poppins font-light mb-16 max-w-3xl mx-auto">
          La première solution d'intelligence artificielle française pour optimiser votre épargne, investissements et patrimoine personnel.
        </p>

        <div className="grid md:grid-cols-3 gap-12 mb-16 text-center">
          <div>
            <h3 className="font-semibold text-gray-900 font-poppins mb-4">Sécurité</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Agrément ACPR</p>
              <p>Conformité PSD2</p>
              <p>Hébergement France</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 font-poppins mb-4">Support</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>FAQ et guides</p>
              <p>Chat 7j/7</p>
              <p>contact@finsight.fr</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 font-poppins mb-4">Ressources</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Blog finance</p>
              <p>Calculateurs</p>
              <p>Webinaires gratuits</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-12 text-gray-400 font-poppins text-sm">
          <a href="#" className="hover:text-blue-600 transition-colors duration-300">Politique de confidentialité</a>
          <a href="#" className="hover:text-blue-600 transition-colors duration-300">Conditions générales</a>
          <a href="#" className="hover:text-blue-600 transition-colors duration-300">Mentions légales</a>
          <a href="#" className="hover:text-blue-600 transition-colors duration-300">Plan du site</a>
        </div>

        <div className="border-t border-gray-200 mt-16 pt-8">
          <div className="text-sm text-gray-400 font-poppins">
            © 2024 FinSight. Conçu en France.
          </div>
        </div>
      </div>
    </footer>
  )
} 