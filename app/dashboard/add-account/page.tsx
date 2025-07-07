'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Popular European banks supported by GoCardless
const supportedBanks = [
  {
    id: 'revolut',
    name: 'Revolut',
    description: 'Digital bank populaire en Europe',
    logo: '💳',
    countries: ['GB', 'FR', 'DE', 'ES', 'IT'],
    popular: true
  },
  {
    id: 'hsbc',
    name: 'HSBC',
    description: 'Banque internationale',
    logo: '🏦',
    countries: ['GB'],
    popular: true
  },
  {
    id: 'santander',
    name: 'Santander',
    description: 'Banque européenne',
    logo: '🏛️',
    countries: ['GB', 'ES', 'DE', 'PT'],
    popular: true
  },
  {
    id: 'ing',
    name: 'ING',
    description: 'Banque en ligne',
    logo: '🧡',
    countries: ['NL', 'DE', 'FR', 'BE'],
    popular: true
  },
  {
    id: 'barclays',
    name: 'Barclays',
    description: 'Banque britannique',
    logo: '🏦',
    countries: ['GB'],
    popular: false
  },
  {
    id: 'lloyds',
    name: 'Lloyds Bank',
    description: 'Banque du Royaume-Uni',
    logo: '🐎',
    countries: ['GB'],
    popular: false
  }
]

export default function AddAccountPage() {
  const searchParams = useSearchParams()
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)

  useEffect(() => {
    // Handle callback messages
    const error = searchParams.get('error')
    const success = searchParams.get('success')
    const warning = searchParams.get('warning')
    const messageText = searchParams.get('message')

    if (success && messageText) {
      setMessage({ type: 'success', text: decodeURIComponent(messageText) })
    } else if (warning && messageText) {
      setMessage({ type: 'warning', text: decodeURIComponent(messageText) })
    } else if (error && messageText) {
      setMessage({ type: 'error', text: decodeURIComponent(messageText) })
    }
  }, [searchParams])

  const handleBankConnection = async (bankName: string) => {
    if (isConnecting) return
    
    setIsConnecting(true)
    setSelectedBank(bankName)
    setMessage(null)

    try {
      const response = await fetch('/api/gocardless/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bankName })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to bank authorization
        window.location.href = data.authUrl
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Échec de la connexion à la banque'
        })
      }
    } catch (error) {
      console.error('Bank connection error:', error)
      setMessage({ 
        type: 'error', 
        text: 'Erreur de connexion. Veuillez réessayer.'
      })
    } finally {
      setIsConnecting(false)
      setSelectedBank(null)
    }
  }

  const popularBanks = supportedBanks.filter(bank => bank.popular)
  const otherBanks = supportedBanks.filter(bank => !bank.popular)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Connecter votre banque
        </h1>
        <p className="text-gray-600 text-lg">
          Connectez votre compte bancaire pour synchroniser automatiquement vos transactions et analyser vos finances.
        </p>
      </div>

      {/* Message display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Popular Banks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⭐</span>
          Banques populaires
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {popularBanks.map((bank) => (
            <Card key={bank.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{bank.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{bank.name}</h3>
                    {bank.id === 'revolut' && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Recommandé
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{bank.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {bank.countries.map(country => (
                      <Badge key={country} variant="secondary" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleBankConnection(bank.id)}
                    disabled={isConnecting}
                    className="w-full"
                    variant={bank.id === 'revolut' ? 'default' : 'outline'}
                  >
                    {isConnecting && selectedBank === bank.id ? (
                      <>
                        <span className="mr-2">⏳</span>
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🔗</span>
                        Connecter {bank.name}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Other Banks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🏦</span>
          Autres banques
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherBanks.map((bank) => (
            <Card key={bank.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">{bank.logo}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">{bank.name}</h3>
                  <p className="text-gray-500 text-xs">{bank.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {bank.countries.map(country => (
                  <Badge key={country} variant="secondary" className="text-xs">
                    {country}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={() => handleBankConnection(bank.id)}
                disabled={isConnecting}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isConnecting && selectedBank === bank.id ? (
                  <>⏳ Connexion...</>
                ) : (
                  <>🔗 Connecter</>
                )}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Information Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <span className="mr-2">ℹ️</span>
          Comment ça fonctionne
        </h3>
        <div className="space-y-3 text-blue-800">
          <div className="flex items-start space-x-3">
            <span className="font-bold text-blue-600">1.</span>
            <p className="text-sm">
              <strong>Sélectionnez votre banque</strong> - Choisissez votre banque dans la liste ci-dessus
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="font-bold text-blue-600">2.</span>
            <p className="text-sm">
              <strong>Autorisation sécurisée</strong> - Vous serez redirigé vers votre banque pour autoriser la connexion
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="font-bold text-blue-600">3.</span>
            <p className="text-sm">
              <strong>Synchronisation automatique</strong> - Vos transactions seront synchronisées en temps réel
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white rounded border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>🔒 Sécurité :</strong> Nous utilisons l'Open Banking européen (PSD2) pour accéder à vos données bancaires de manière sécurisée. 
            Nous ne stockons jamais vos identifiants bancaires et n'avons accès qu'aux données que vous autorisez.
          </p>
        </div>
      </Card>

      {/* Support Section */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Votre banque n'est pas listée ? {' '}
          <span className="text-blue-600 font-medium">
            Nous supportons plus de 2,500 banques européennes
          </span>
          {' '} via l'Open Banking.
        </p>
        <p className="text-gray-400 text-xs mt-2">
          Propulsé par GoCardless Bank Account Data API
        </p>
      </div>
    </div>
  )
} 