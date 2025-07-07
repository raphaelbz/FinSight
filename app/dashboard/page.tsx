"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, User, LogOut, BarChart3, DollarSign, TrendingDown, TrendingUp as TrendingUpIcon, CheckCircle, Plus, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

interface RevolutData {
  connected: boolean
  accountName: string
  balance: number
  currency: string
  transactions: Array<{
    id: string
    description: string
    amount: number
    date: string
    category: string
  }>
  connectedAt: string
}

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState<string | null>(null)
  const [revolutData, setRevolutData] = useState<RevolutData | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user just connected a bank or had an error
  useEffect(() => {
    const connected = searchParams.get('connected')
    const status = searchParams.get('status')
    const error = searchParams.get('error')
    
    if (connected === 'revolut' && status === 'success') {
      setShowSuccessMessage(true)
      // Clear the URL parameters
      router.replace('/dashboard')
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
    
    if (error) {
      const errorMessages: { [key: string]: string } = {
        'revolut_auth_failed': 'Échec de l\'authentification Revolut',
        'missing_parameters': 'Paramètres manquants dans la réponse',
        'invalid_state': 'État invalide - possible tentative de fraude',
        'no_accounts': 'Aucun compte trouvé',
        'api_failed': 'Erreur de l\'API Revolut',
        'internal_error': 'Erreur interne du serveur'
      }
      
      setShowErrorMessage(errorMessages[error] || 'Erreur inconnue')
      router.replace('/dashboard')
      setTimeout(() => setShowErrorMessage(null), 10000)
    }
  }, [searchParams, router])

  // Load Revolut data from API
  useEffect(() => {
    const fetchRevolutData = async () => {
      try {
        const response = await fetch('/api/revolut/data')
        const data = await response.json()
        
        if (response.ok && data.connected) {
          setRevolutData(data)
        } else {
          setRevolutData(null)
        }
      } catch (error) {
        console.error('Error fetching Revolut data:', error)
        setRevolutData(null)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchRevolutData()
    }
  }, [session, showSuccessMessage]) // Re-fetch when user connects

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) router.push("/login")
  }, [session, status, router])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handleDisconnectRevolut = async () => {
    try {
      const response = await fetch('/api/revolut/data', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setRevolutData(null)
      }
    } catch (error) {
      console.error('Error disconnecting Revolut:', error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  // Calculate stats from Revolut data
  const stats = revolutData ? {
    balance: revolutData.balance,
    income: revolutData.transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
    expenses: Math.abs(revolutData.transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)),
    savings: revolutData.balance * 0.3 // Mock savings calculation
  } : {
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FinSight</h1>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {session?.user?.email || "Utilisateur"}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tableau de bord</h2>
          <p className="text-gray-600">Bienvenue sur votre dashboard FinSight</p>
        </div>

        {/* Success message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Revolut connecté avec succès !</p>
                <p className="text-sm text-green-700">
                  Vos données financières Revolut sont maintenant synchronisées.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {showErrorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Erreur de connexion</p>
                <p className="text-sm text-red-700">{showErrorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Connected banks */}
        {revolutData && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comptes connectés</h3>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
                    💳
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{revolutData.accountName}</p>
                      <Badge variant="beta" className="text-xs">BETA</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Connecté le {new Date(revolutData.connectedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {revolutData.balance.toLocaleString('fr-FR', { 
                        style: 'currency', 
                        currency: revolutData.currency 
                      })}
                    </p>
                    <p className="text-sm text-gray-600">Solde actuel</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDisconnectRevolut}
                    className="text-red-600 hover:text-red-700"
                  >
                    Déconnecter
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solde Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                {revolutData && (
                  <p className="text-sm text-green-600 mt-1">Via API Revolut</p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.income.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                {revolutData && (
                  <p className="text-sm text-green-600 mt-1">3 derniers mois</p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dépenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.expenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                {revolutData && (
                  <p className="text-sm text-red-600 mt-1">3 derniers mois</p>
                )}
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Épargne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.savings.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                {revolutData && (
                  <p className="text-sm text-green-600 mt-1">Estimation</p>
                )}
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Content area */}
        {!revolutData ? (
          /* Empty state */
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connectez votre compte Revolut
              </h3>
              <p className="text-gray-600 mb-6">
                Utilisez l'API Open Banking officielle de Revolut pour synchroniser automatiquement vos transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Link href="/dashboard/add-account">
                    <Plus className="h-4 w-4 mr-2" />
                    Connecter Revolut
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* Transactions */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent transactions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Transactions récentes</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Revolut</Badge>
                  <Badge variant="success" className="text-xs">API Réelle</Badge>
                </div>
              </div>
              <div className="space-y-4">
                {revolutData.transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <TrendingUpIcon className={`h-5 w-5 ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600 rotate-180'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('fr-FR')} • {transaction.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount.toLocaleString('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h3>
              <div className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard/add-account">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un autre compte
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyser mes dépenses (Bientôt)
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Rapport mensuel (Bientôt)
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
} 