"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowLeft, Shield, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AddAccountPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const router = useRouter()

  const handleConnectRevolut = async () => {
    setIsConnecting(true)
    
    try {
      // Redirect to Revolut OAuth flow
      window.location.href = '/api/revolut/auth'
    } catch (error) {
      console.error('Error connecting to Revolut:', error)
      setIsConnecting(false)
    }
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour au dashboard</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FinSight</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Connecter votre banque
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connectez votre compte Revolut pour synchroniser automatiquement vos transactions et analyser vos finances.
          </p>
        </div>

        {/* Revolut card */}
        <div className="max-w-md mx-auto mb-8">
          <Card className="p-6 border border-orange-200 bg-orange-50">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
                <svg className="h-8 w-8 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Revolut</h3>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                    BETA
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    CERTIFICATS REQUIS
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Connectez votre compte Revolut pour voir vos transactions et soldes en temps réel. 
                  <strong>Nécessite des certificats Open Banking OBIE/eIDAS.</strong>
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Configuration requise :</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Certificats OBIE (UK) ou eIDAS (EU)</li>
                        <li>Statut de Third Party Provider régulé</li>
                        <li>Configuration avancée des certificats SSL</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                >
                  Configuration de certificats requise
                </button>
                
                <div className="mt-3 text-xs text-gray-500">
                  Pour utiliser cette fonctionnalité, consultez la documentation Revolut Open Banking.
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Real integration info */}
        <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Intégration réelle</h4>
              <p className="text-blue-800 text-sm leading-relaxed mb-3">
                Cette fonctionnalité utilise l'API Open Banking officielle de Revolut pour une connexion sécurisée 
                et authentique à votre compte bancaire.
              </p>
              <div className="text-blue-700 text-xs space-y-1">
                <p>• Authentification OAuth2 officielle</p>
                <p>• Conformité PSD2 et Open Banking</p>
                <p>• Données chiffrées de bout en bout</p>
                <p>• Accès en lecture seule</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">Configuration requise</h4>
              <p className="text-amber-800 text-sm leading-relaxed mb-3">
                Pour utiliser cette fonctionnalité, l'application doit être configurée avec :
              </p>
              <div className="text-amber-700 text-xs space-y-1">
                <p>• Clés API Revolut Open Banking</p>
                <p>• Certificats de transport valides</p>
                <p>• Enregistrement auprès de Revolut</p>
                <p>• Variables d'environnement configurées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Setup instructions */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Shield className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Configuration développeur</h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                Pour activer cette fonctionnalité, créez un fichier <code className="bg-gray-100 px-1 rounded">.env.local</code> avec :
              </p>
              <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-700 space-y-1">
                <p>REVOLUT_CLIENT_ID=votre_client_id</p>
                <p>REVOLUT_CLIENT_SECRET=votre_client_secret</p>
                <p>REVOLUT_ENVIRONMENT=sandbox</p>
                <p>NEXTAUTH_URL=http://localhost:3000</p>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Consultez la documentation Revolut Developer pour obtenir vos clés API.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 