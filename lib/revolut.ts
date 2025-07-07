interface RevolutConfig {
  clientId: string
  clientSecret: string
  baseUrl: string
  redirectUri: string
  financialId: string
}

interface RevolutTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

interface RevolutAccount {
  accountId: string
  currency: string
  accountType: string
  accountSubType: string
  nickname?: string
  balances: {
    amount: string
    currency: string
    type: string
  }[]
}

interface RevolutTransaction {
  transactionId: string
  amount: {
    amount: string
    currency: string
  }
  creditDebitIndicator: 'Credit' | 'Debit'
  status: string
  bookingDateTime: string
  valueDateTime?: string
  transactionInformation?: string
  merchantDetails?: {
    merchantName?: string
    merchantCategoryCode?: string
  }
  bankTransactionCode?: {
    code: string
    subCode: string
  }
}

class RevolutAPI {
  private config: RevolutConfig

  constructor() {
    this.config = {
      clientId: process.env.REVOLUT_CLIENT_ID || '',
      clientSecret: process.env.REVOLUT_CLIENT_SECRET || '',
      baseUrl: process.env.REVOLUT_ENVIRONMENT === 'production' 
        ? process.env.REVOLUT_PRODUCTION_BASE_URL || 'https://oba.revolut.com'
        : process.env.REVOLUT_SANDBOX_BASE_URL || 'https://sandbox-oba.revolut.com',
      redirectUri: `${process.env.NEXTAUTH_URL}/api/revolut/callback`,
      financialId: process.env.REVOLUT_FINANCIAL_ID || '001580000103UAvAAM'
    }
  }

  // Generate authorization URL for OAuth2 flow
  getAuthorizationUrl(state: string, nonce: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'accounts',
      state,
      nonce
    })

    return `${this.config.baseUrl}/auth/authorize?${params.toString()}`
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<RevolutTokenResponse> {
    const response = await fetch(`${this.config.baseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    return response.json()
  }

  // Get accounts using access token
  async getAccounts(accessToken: string): Promise<RevolutAccount[]> {
    const response = await fetch(`${this.config.baseUrl}/accounts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-fapi-financial-id': this.config.financialId
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch accounts: ${error}`)
    }

    const data = await response.json()
    return data.Data?.Account || []
  }

  // Get transactions for a specific account
  async getTransactions(
    accessToken: string, 
    accountId: string, 
    fromDate?: string, 
    toDate?: string
  ): Promise<RevolutTransaction[]> {
    const params = new URLSearchParams()
    if (fromDate) params.append('fromBookingDateTime', fromDate)
    if (toDate) params.append('toBookingDateTime', toDate)

    const url = `${this.config.baseUrl}/accounts/${accountId}/transactions${
      params.toString() ? `?${params.toString()}` : ''
    }`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-fapi-financial-id': this.config.financialId
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch transactions: ${error}`)
    }

    const data = await response.json()
    return data.Data?.Transaction || []
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<RevolutTokenResponse> {
    const response = await fetch(`${this.config.baseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token refresh failed: ${error}`)
    }

    return response.json()
  }
}

export const revolutAPI = new RevolutAPI()
export type { RevolutAccount, RevolutTransaction, RevolutTokenResponse } 