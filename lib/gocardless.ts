interface GoCardlessConfig {
  secretId: string
  secretKey: string
  baseUrl: string
  redirectUri: string
}

interface Institution {
  id: string
  name: string
  bic: string
  transaction_total_days: string
  countries: string[]
  logo: string
  max_access_valid_for_days: string
}

interface Requisition {
  id: string
  created: string
  redirect: string
  status: string
  institution_id: string
  agreement?: string
  reference: string
  accounts: string[]
  user_language: string
  link: string
  ssn?: string
  account_selection: boolean
  redirect_immediate: boolean
}

interface Account {
  id: string
  created: string
  last_accessed: string
  iban: string
  institution_id: string
  status: string
}

interface Transaction {
  transactionId: string
  debtorName?: string
  debtorAccount?: {
    iban?: string
  }
  creditorName?: string
  creditorAccount?: {
    iban?: string
  }
  transactionAmount: {
    currency: string
    amount: string
  }
  bankTransactionCode?: string
  bookingDate: string
  valueDate: string
  remittanceInformationUnstructured?: string
}

interface TransactionResponse {
  transactions: {
    booked: Transaction[]
    pending: Transaction[]
  }
}

interface Balance {
  balanceAmount: {
    currency: string
    amount: string
  }
  balanceType: string
  referenceDate?: string
}

interface AccountDetails {
  resourceId: string
  iban: string
  currency: string
  ownerName?: string
  name?: string
  displayName?: string
  product?: string
  cashAccountType?: string
}

class GoCardlessAPI {
  private config: GoCardlessConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    this.config = {
      secretId: process.env.GOCARDLESS_SECRET_ID || '',
      secretKey: process.env.GOCARDLESS_SECRET_KEY || '',
      baseUrl: process.env.GOCARDLESS_BASE_URL || 'https://bankaccountdata.gocardless.com/api/v2',
      redirectUri: `${process.env.NEXTAUTH_URL}/api/gocardless/callback`
    }
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    const response = await fetch(`${this.config.baseUrl}/token/new/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secret_id: this.config.secretId,
        secret_key: this.config.secretKey
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data = await response.json()
    this.accessToken = data.access
    // Set expiry to 5 minutes before actual expiry for safety
    this.tokenExpiry = new Date(Date.now() + (data.access_expires - 300) * 1000)
    
    if (!this.accessToken) {
      throw new Error('No access token received from GoCardless API')
    }
    
    return this.accessToken
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken()
    
    if (!token) {
      throw new Error('Failed to obtain access token')
    }
    
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GoCardless API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  async getInstitutions(country: string = 'GB'): Promise<Institution[]> {
    return this.makeRequest(`/institutions/?country=${country.toUpperCase()}`)
  }

  async getInstitution(institutionId: string): Promise<Institution> {
    return this.makeRequest(`/institutions/${institutionId}/`)
  }

  async createEndUserAgreement(institutionId: string, options: {
    maxHistoricalDays?: number
    accessValidForDays?: number
    accessScope?: string[]
  } = {}): Promise<any> {
    const defaultOptions = {
      maxHistoricalDays: 180,
      accessValidForDays: 90,
      accessScope: ['balances', 'details', 'transactions']
    }

    const agreement = { ...defaultOptions, ...options }

    return this.makeRequest('/agreements/enduser/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        institution_id: institutionId,
        max_historical_days: agreement.maxHistoricalDays,
        access_valid_for_days: agreement.accessValidForDays,
        access_scope: agreement.accessScope
      })
    })
  }

  async createRequisition(institutionId: string, reference: string, agreementId?: string): Promise<Requisition> {
    const body: any = {
      redirect: this.config.redirectUri,
      institution_id: institutionId,
      reference: reference,
      user_language: 'EN'
    }

    if (agreementId) {
      body.agreement = agreementId
    }

    return this.makeRequest('/requisitions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }

  async getRequisition(requisitionId: string): Promise<Requisition> {
    return this.makeRequest(`/requisitions/${requisitionId}/`)
  }

  async deleteRequisition(requisitionId: string): Promise<void> {
    await this.makeRequest(`/requisitions/${requisitionId}/`, {
      method: 'DELETE'
    })
  }

  async getAccountDetails(accountId: string): Promise<AccountDetails> {
    const response = await this.makeRequest(`/accounts/${accountId}/details/`)
    return response.account
  }

  async getAccountBalances(accountId: string): Promise<Balance[]> {
    const response = await this.makeRequest(`/accounts/${accountId}/balances/`)
    return response.balances
  }

  async getAccountTransactions(accountId: string): Promise<TransactionResponse> {
    return this.makeRequest(`/accounts/${accountId}/transactions/`)
  }

  // Helper method to find Revolut institution
  async getRevolutInstitution(country: string = 'GB'): Promise<Institution | null> {
    const institutions = await this.getInstitutions(country)
    return institutions.find(inst => 
      inst.name.toLowerCase().includes('revolut') || 
      inst.id.toLowerCase().includes('revolut')
    ) || null
  }

  // Helper method to start bank connection flow
  async startBankConnection(bankName: string, userEmail: string): Promise<{ 
    link: string, 
    requisitionId: string, 
    institutionName: string 
  }> {
    // Get institutions for GB (Revolut's main market)
    const institutions = await this.getInstitutions('GB')
    
    let institution: Institution | null = null
    
    if (bankName.toLowerCase() === 'revolut') {
      institution = await this.getRevolutInstitution('GB')
    } else {
      // Find institution by name
      institution = institutions.find(inst => 
        inst.name.toLowerCase().includes(bankName.toLowerCase())
      ) || null
    }

    if (!institution) {
      throw new Error(`Institution ${bankName} not found`)
    }

    // Create agreement for better data access
    const agreement = await this.createEndUserAgreement(institution.id, {
      maxHistoricalDays: 365, // 1 year of transaction history
      accessValidForDays: 90,  // 90 days access
      accessScope: ['balances', 'details', 'transactions']
    })

    // Create requisition with unique reference
    const reference = `finsight_${userEmail}_${Date.now()}`
    const requisition = await this.createRequisition(
      institution.id, 
      reference, 
      agreement.id
    )

    return {
      link: requisition.link,
      requisitionId: requisition.id,
      institutionName: institution.name
    }
  }

  // Helper method to get all account data after successful connection
  async getConnectedAccountData(requisitionId: string): Promise<{
    accounts: Array<{
      id: string
      details: AccountDetails
      balances: Balance[]
      transactions: Transaction[]
    }>
    institution: string
  }> {
    const requisition = await this.getRequisition(requisitionId)
    
    if (requisition.status !== 'LN') { // LN = Linked
      throw new Error(`Requisition not ready. Status: ${requisition.status}`)
    }

    const accountsData = []
    
    for (const accountId of requisition.accounts) {
      try {
        const [details, balances, transactionResponse] = await Promise.all([
          this.getAccountDetails(accountId),
          this.getAccountBalances(accountId),
          this.getAccountTransactions(accountId)
        ])

        // Combine booked and pending transactions
        const allTransactions = [
          ...transactionResponse.transactions.booked,
          ...transactionResponse.transactions.pending.map(t => ({
            ...t,
            transactionId: `pending_${Date.now()}_${Math.random()}`,
            bookingDate: t.valueDate || new Date().toISOString().split('T')[0],
            pending: true
          }))
        ]

        accountsData.push({
          id: accountId,
          details,
          balances,
          transactions: allTransactions
        })
      } catch (error) {
        console.error(`Error fetching data for account ${accountId}:`, error)
        // Continue with other accounts even if one fails
      }
    }

    // Get institution name
    const institution = await this.getInstitution(requisition.institution_id)

    return {
      accounts: accountsData,
      institution: institution.name
    }
  }
}

// Export singleton instance
export const goCardlessAPI = new GoCardlessAPI()

// Export types for use in other files
export type { 
  Institution, 
  Requisition, 
  Account, 
  Transaction, 
  Balance, 
  AccountDetails,
  TransactionResponse
} 