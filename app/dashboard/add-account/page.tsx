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
          <Card 
            className="p-6 border-2 border-blue-100 hover:border-blue-200 transition-colors"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white text-2xl rounded-2xl mb-4">
                💳
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">Revolut</h3>
                <Badge variant="beta" className="text-xs">
                  BETA
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Banque digitale européenne
              </p>
              <Button 
                onClick={handleConnectRevolut}
                disabled={isConnecting}
                className="w-full h-12"
              >
                {isConnecting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Redirection...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Connecter avec OAuth</span>
                  </div>
                )}
              </Button>
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