'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FRENCH_BANKS } from '@/lib/saltedge'
import { ArrowLeft, Shield, Clock, Database, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// French banks with enhanced information
const frenchBanksData = [
  {
    code: 'revolut',
    name: 'Revolut',
    description: 'Banque numérique leader en Europe',
    logo: '🟣',
    category: 'Banque numérique',
    popular: true,
    features: ['Transactions instantanées', 'Multi-devises', 'Cartes virtuelles']
  },
  {
    code: 'bnp_paribas',
    name: 'BNP Paribas',
    description: 'Leader bancaire français',
    logo: '🏦',
    category: 'Banque traditionnelle',
    popular: true,
    features: ['Réseau étendu', 'Services premium', 'Banque privée']
  },
  {
    code: 'credit_agricole',
    name: 'Crédit Agricole',
    description: 'Banque mutualiste française',
    logo: '🌾',
    category: 'Banque mutualiste',
    popular: true,
    features: ['Réseau local', 'Agriculture', 'Coopératif']
  },
  {
    code: 'societe_generale',
    name: 'Société Générale',
    description: 'Banque internationale française',
    logo: '🔴',
    category: 'Banque internationale',
    popular: true,
    features: ['Services digitaux', 'International', 'Innovation']
  },
  {
    code: 'lcl',
    name: 'LCL',
    description: 'Le Crédit Lyonnais',
    logo: '💼',
    category: 'Banque traditionnelle',
    popular: false,
    features: ['Conseil personnalisé', 'Proximité', 'Accompagnement']
  },
  {
    code: 'banque_postale',
    name: 'La Banque Postale',
    description: 'Banque du service public',
    logo: '📮',
    category: 'Service public',
    popular: false,
    features: ['Accessibilité', 'Service public', 'Solidarité']
  },
  {
    code: 'boursorama',
    name: 'Boursorama',
    description: 'Banque en ligne leader',
    logo: '💰',
    category: 'Banque en ligne',
    popular: true,
    features: ['Frais réduits', 'Trading', 'Digital first']
  },
  {
    code: 'ing_direct',
    name: 'ING Direct',
    description: 'Banque en ligne européenne',
    logo: '🧡',
    category: 'Banque en ligne',
    popular: false,
    features: ['Simple', 'Transparence', 'Épargne']
  },
  {
    code: 'hello_bank',
    name: 'Hello Bank!',
    description: 'Banque mobile de BNP Paribas',
    logo: '👋',
    category: 'Banque mobile',
    popular: false,
    features: ['Mobile first', 'Jeunes', 'Digital native']
  },
  {
    code: 'credit_mutuel',
    name: 'Crédit Mutuel',
    description: 'Banque coopérative régionale',
    logo: '🤝',
    category: 'Banque coopérative',
    popular: false,
    features: ['Régional', 'Mutualiste', 'Proximité']
  }
]

export default function AddAccountPage() {
  const searchParams = useSearchParams()
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)
  const [availableBanks, setAvailableBanks] = useState<any[]>([])
  const [loadingBanks, setLoadingBanks] = useState(true)

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

  // Load available banks from Salt Edge API
  useEffect(() => {
    const fetchAvailableBanks = async () => {
      try {
        const response = await fetch('/api/saltedge/auth')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setAvailableBanks(data.data || [])
          }
        }
      } catch (error) {
        console.error('Error fetching banks:', error)
      } finally {
        setLoadingBanks(false)
      }
    }

    fetchAvailableBanks()
  }, [])

  const handleBankConnection = async (bankCode: string) => {
    if (isConnecting) return
    
    setIsConnecting(true)
    setSelectedBank(bankCode)
    setMessage(null)

    try {
      const response = await fetch('/api/saltedge/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider_code: bankCode })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to Salt Edge widget
        window.location.href = data.data.connect_url
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Échec de la connexion à la banque'
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

  const handleGenericConnection = async () => {
    if (isConnecting) return
    
    setIsConnecting(true)
    setSelectedBank('generic')
    setMessage(null)

    try {
      const response = await fetch('/api/saltedge/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}) // No specific provider - will show bank selection in widget
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to Salt Edge widget with bank selection
        window.location.href = data.data.connect_url
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Échec de la connexion'
        })
      }
    } catch (error) {
      console.error('Generic connection error:', error)
      setMessage({ 
        type: 'error', 
        text: 'Erreur de connexion. Veuillez réessayer.'
      })
    } finally {
      setIsConnecting(false)
      setSelectedBank(null)
    }
  }

  const popularBanks = frenchBanksData.filter(bank => bank.popular)
  const otherBanks = frenchBanksData.filter(bank => !bank.popular)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Connecter votre banque française
        </h1>
        <p className="text-gray-600 text-lg">
          Connectez vos comptes bancaires français via Salt Edge API pour synchroniser automatiquement vos transactions.
        </p>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>Sécurisé par PSD2</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            <span>2,500+ banques supportées</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Synchronisation temps réel</span>
          </div>
        </div>
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

      {/* Quick Connect - All Banks */}
      <div className="mb-8">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🚀 Connexion rapide - Toutes banques
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                Accédez à plus de 2,500 banques européennes incluant toutes les banques françaises
              </p>
              <div className="flex flex-wrap gap-2">
                {FRENCH_BANKS.slice(0, 5).map((bank) => (
                  <span key={bank.code} className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 rounded-full text-xs text-blue-800">
                    <span>{bank.logo}</span>
                    <span>{bank.name}</span>
                  </span>
                ))}
                <span className="text-blue-600 text-xs px-2 py-1">et 2,495+ autres...</span>
              </div>
            </div>
            <Button
              onClick={handleGenericConnection}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isConnecting && selectedBank === 'generic' ? (
                <>⏳ Connexion...</>
              ) : (
                <>
                  Choisir ma banque
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Popular French Banks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⭐</span>
          Banques françaises populaires
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {popularBanks.map((bank) => (
            <Card key={bank.code} className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-start space-x-4">
                <div className="text-3xl bg-gray-50 rounded-lg p-2">{bank.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{bank.name}</h3>
                    {bank.code === 'revolut' && (
                      <Badge variant="default" className="bg-purple-100 text-purple-800">
                        Recommandé
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {bank.category}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{bank.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {bank.features.map(feature => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleBankConnection(bank.code)}
                    disabled={isConnecting}
                    className="w-full"
                    variant={bank.code === 'revolut' ? 'default' : 'outline'}
                  >
                    {isConnecting && selectedBank === bank.code ? (
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

      {/* Other French Banks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🏦</span>
          Autres banques françaises
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherBanks.map((bank) => (
            <Card key={bank.code} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl bg-gray-50 rounded-lg p-1">{bank.logo}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">{bank.name}</h3>
                  <p className="text-gray-500 text-xs">{bank.category}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">{bank.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {bank.features.slice(0, 2).map(feature => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={() => handleBankConnection(bank.code)}
                disabled={isConnecting}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isConnecting && selectedBank === bank.code ? (
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
      <Card className="p-6 bg-blue-50 border-blue-200 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <span className="mr-2">ℹ️</span>
          Comment ça fonctionne avec Salt Edge
        </h3>
        <div className="space-y-3 text-blue-800">
          <div className="flex items-start space-x-3">
            <span className="font-bold text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            <p className="text-sm">
              <strong>Sélectionnez votre banque</strong> - Choisissez parmi plus de 2,500 banques européennes
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="font-bold text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
            <p className="text-sm">
              <strong>Authentification sécurisée</strong> - Connexion via le widget Salt Edge sécurisé
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="font-bold text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
            <p className="text-sm">
              <strong>Synchronisation temps réel</strong> - Vos données bancaires sont synchronisées automatiquement
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white rounded border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>🔒 Sécurité renforcée :</strong> Salt Edge utilise le standard Open Banking européen (PSD2) avec chiffrement de bout en bout. 
            Vos identifiants bancaires ne sont jamais stockés et nous respectons les plus hauts standards de sécurité financière.
          </p>
        </div>
      </Card>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4 text-center">
          <div className="text-3xl mb-3">🛡️</div>
          <h4 className="font-semibold text-gray-900 mb-2">Sécurité maximale</h4>
          <p className="text-sm text-gray-600">
            Certification PSD2, chiffrement bancaire et authentification forte
          </p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl mb-3">⚡</div>
          <h4 className="font-semibold text-gray-900 mb-2">Synchronisation rapide</h4>
          <p className="text-sm text-gray-600">
            Transactions mises à jour en temps réel avec l'API Salt Edge
          </p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl mb-3">🌍</div>
          <h4 className="font-semibold text-gray-900 mb-2">Couverture étendue</h4>
          <p className="text-sm text-gray-600">
            Compatible avec 2,500+ banques dans 50+ pays européens
          </p>
        </Card>
      </div>

      {/* Support Section */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-2">
          Votre banque n'est pas listée ? Pas de problème !
        </p>
        <p className="text-gray-600 font-medium mb-4">
          🇫🇷 Toutes les banques françaises sont supportées via Salt Edge API
        </p>
        <div className="flex justify-center">
          <Button 
            onClick={handleGenericConnection}
            disabled={isConnecting}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isConnecting && selectedBank === 'generic' ? (
              <>⏳ Connexion...</>
            ) : (
              <>
                🔍 Rechercher ma banque
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        <p className="text-gray-400 text-xs mt-4">
          Propulsé par Salt Edge • API PSD2 certifiée • Compatible toutes banques françaises
        </p>
      </div>
    </div>
  )
} 