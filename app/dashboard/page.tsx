"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, User, LogOut, BarChart3, DollarSign, TrendingDown, TrendingUp as TrendingUpIcon, CheckCircle, Plus, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { FRENCH_BANKS } from "@/lib/saltedge"

interface SaltEdgeAccount {
  id: string
  name: string
  balance: number
  currency: string
  type: string
  iban?: string
  accountNumber?: string
}

interface SaltEdgeTransaction {
  id: string
  date: string
  description: string
  amount: number
  currency: string
  type: 'credit' | 'debit'
  category: string
  balance?: number
}

interface SaltEdgeConnection {
  id: string
  provider_name: string
  status: string
  last_success_at: string
  created_at: string
}

interface BankingData {
  connection: SaltEdgeConnection
  accounts: SaltEdgeAccount[]
  transactions: SaltEdgeTransaction[]
  transactions_summary?: {
    total_count: number
    displayed_count: number
    date_range: {
      from: string | null
      to: string | null
    }
  }
}

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'warning' | 'info', message: string} | null>(null)
  const [bankingData, setBankingData] = useState<BankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Check URL parameters for status messages
  useEffect(() => {
    const status = searchParams.get('status')
    const message = searchParams.get('message')
    
    if (status && message) {
      setStatusMessage({
        type: status as 'success' | 'error' | 'warning' | 'info',
        message: decodeURIComponent(message)
      })
      
      // Clear URL parameters
      router.replace('/dashboard')
      
      // Hide message after 10 seconds
      setTimeout(() => setStatusMessage(null), 10000)
    }
  }, [searchParams, router])

  // Load banking data from Salt Edge API
  useEffect(() => {
    const fetchBankingData = async () => {
      setLoading(true)
      try {
        // First check if user has any connections
        const response = await fetch('/api/saltedge/data?type=all')
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setBankingData(result.data)
          } else {
            setBankingData(null)
          }
        } else if (response.status === 404) {
          // No connections found
          setBankingData(null)
        } else {
          console.error('Error fetching banking data:', await response.text())
          setBankingData(null)
        }
      } catch (error) {
        console.error('Error fetching banking data:', error)
        setBankingData(null)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchBankingData()
    }
  }, [session])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) router.push("/login")
  }, [session, status, router])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handleDisconnectBank = async () => {
    if (!bankingData?.connection?.id) return
    
    try {
      const response = await fetch(`/api/saltedge/data?connection_id=${bankingData.connection.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setBankingData(null)
        setStatusMessage({
          type: 'info',
          message: 'Compte bancaire déconnecté avec succès'
        })
      }
    } catch (error) {
      console.error('Error disconnecting bank:', error)
      setStatusMessage({
        type: 'error',
        message: 'Erreur lors de la déconnexion'
      })
    }
  }

  const handleRefreshData = async () => {
    if (!bankingData?.connection?.id) return
    
    setRefreshing(true)
    try {
      const response = await fetch('/api/saltedge/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connection_id: bankingData.connection.id,
          type: 'refresh'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data.connect_url) {
          window.open(result.data.connect_url, '_blank')
        }
      } else {
        setStatusMessage({
          type: 'error',
          message: 'Impossible d\'actualiser les données'
        })
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
      setStatusMessage({
        type: 'error',
        message: 'Erreur lors de l\'actualisation'
      })
    } finally {
      setRefreshing(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  // Calculate stats from banking data
  const stats = bankingData ? {
    balance: bankingData.accounts.reduce((sum, account) => sum + account.balance, 0),
    income: bankingData.transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0),
    expenses: bankingData.transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0),
    savings: bankingData.accounts.reduce((sum, account) => sum + account.balance, 0) * 0.3 // Mock calculation
  } : {
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0
  }

  // Get bank icon for provider
  const getBankIcon = (providerName: string) => {
    const bank = FRENCH_BANKS.find(b => 
      providerName.toLowerCase().includes(b.name.toLowerCase()) ||
      b.name.toLowerCase().includes(providerName.toLowerCase())
    )
    return bank?.logo || '🏦'
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
          <p className="text-gray-600">Gérez vos finances avec {bankingData ? 'Salt Edge API' : 'FinSight'}</p>
        </div>

        {/* Status messages */}
        {statusMessage && (
          <div className={`mb-6 border rounded-lg p-4 ${
            statusMessage.type === 'success' ? 'bg-green-50 border-green-200' :
            statusMessage.type === 'error' ? 'bg-red-50 border-red-200' :
            statusMessage.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center space-x-3">
              {statusMessage.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {statusMessage.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {statusMessage.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
              {statusMessage.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-600" />}
              <div>
                <p className={`font-medium ${
                  statusMessage.type === 'success' ? 'text-green-900' :
                  statusMessage.type === 'error' ? 'text-red-900' :
                  statusMessage.type === 'warning' ? 'text-yellow-900' :
                  'text-blue-900'
                }`}>
                  {statusMessage.type === 'success' && 'Succès !'}
                  {statusMessage.type === 'error' && 'Erreur'}
                  {statusMessage.type === 'warning' && 'Attention'}
                  {statusMessage.type === 'info' && 'Information'}
                </p>
                <p className={`text-sm ${
                  statusMessage.type === 'success' ? 'text-green-700' :
                  statusMessage.type === 'error' ? 'text-red-700' :
                  statusMessage.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {statusMessage.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connected banks */}
        {bankingData && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Comptes connectés</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshData}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </Button>
            </div>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
                    {getBankIcon(bankingData.connection.provider_name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{bankingData.connection.provider_name}</p>
                      <Badge variant="secondary" className="text-xs">Salt Edge</Badge>
                      <Badge variant={bankingData.connection.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {bankingData.connection.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {bankingData.accounts.length} compte{bankingData.accounts.length > 1 ? 's' : ''} • 
                      Connecté le {new Date(bankingData.connection.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {stats.balance.toLocaleString('fr-FR', { 
                        style: 'currency', 
                        currency: bankingData.accounts[0]?.currency || 'EUR'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">Solde total</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDisconnectBank}
                    className="text-red-600 hover:text-red-700"
                  >
                    Déconnecter
                  </Button>
                </div>
              </div>
              
              {/* Individual accounts */}
              {bankingData.accounts.length > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {bankingData.accounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{account.name}</p>
                          <p className="text-xs text-gray-600">{account.type}</p>
                        </div>
                        <p className="font-semibold text-sm text-gray-900">
                          {account.balance.toLocaleString('fr-FR', { 
                            style: 'currency', 
                            currency: account.currency 
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                {bankingData && (
                  <p className="text-sm text-green-600 mt-1">Via Salt Edge API</p>
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
                {bankingData && (
                  <p className="text-sm text-green-600 mt-1">
                    {bankingData.transactions_summary?.displayed_count || 0} transactions
                  </p>
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
                {bankingData && (
                  <p className="text-sm text-red-600 mt-1">
                    {bankingData.transactions.filter(t => t.type === 'debit').length} sorties
                  </p>
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
                {bankingData && (
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
        {!bankingData ? (
          /* Empty state */
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <div className="text-2xl">🇫🇷</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connectez votre banque française
              </h3>
              <p className="text-gray-600 mb-4">
                Connectez vos comptes bancaires français via Salt Edge API. 
                Compatible avec toutes les principales banques françaises.
              </p>
              <div className="mb-6">
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  {FRENCH_BANKS.slice(0, 6).map((bank) => (
                    <span key={bank.code} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                      <span>{bank.logo}</span>
                      <span className="text-gray-700">{bank.name}</span>
                    </span>
                  ))}
                  <span className="inline-flex items-center px-2 py-1 text-gray-500">
                    et {FRENCH_BANKS.length - 6}+ autres...
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Link href="/dashboard/add-account">
                    <Plus className="h-4 w-4 mr-2" />
                    Connecter ma banque
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* Banking data display */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent transactions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Transactions récentes</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{bankingData.connection.provider_name}</Badge>
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">API Réelle</Badge>
                </div>
              </div>
              <div className="space-y-4">
                {bankingData.transactions.slice(0, 8).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <TrendingUpIcon className={`h-5 w-5 ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600 rotate-180'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('fr-FR')} • {transaction.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        {transaction.amount.toLocaleString('fr-FR', { 
                          style: 'currency', 
                          currency: transaction.currency 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {bankingData.transactions_summary && bankingData.transactions_summary.total_count > 8 && (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500">
                      {bankingData.transactions_summary.total_count - 8} transactions supplémentaires
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h3>
              <div className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard/add-account">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une autre banque
                  </Link>
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleRefreshData}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualiser les données
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
              
              {/* Connection info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Informations de connexion</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Dernière sync :</span>
                    <span>{new Date(bankingData.connection.last_success_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statut :</span>
                    <span className={bankingData.connection.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                      {bankingData.connection.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comptes :</span>
                    <span>{bankingData.accounts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transactions :</span>
                    <span>{bankingData.transactions_summary?.total_count || bankingData.transactions.length}</span>
                  </div>
                </div>
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