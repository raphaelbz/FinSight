// Salt Edge API Integration for FinSight
// Supports 2,500+ banks in 50+ countries including France and Revolut

import { createHash, createSign } from 'crypto';

export interface SaltEdgeConfig {
  appId: string;
  secret: string;
  baseUrl: string;
  publicKey?: string;
  privateKey?: string;
}

export interface SaltEdgeCustomer {
  id: string;
  identifier: string;
  secret: string;
  created_at: string;
  updated_at: string;
}

export interface SaltEdgeConnection {
  id: string;
  secret: string;
  provider_id: string;
  provider_code: string;
  provider_name: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
  last_success_at: string;
  status: 'active' | 'inactive' | 'disabled';
  interactive: boolean;
  next_refresh_possible_at: string;
  store_credentials: boolean;
  categorization: string;
  show_consent_confirmation: boolean;
}

export interface SaltEdgeAccount {
  id: string;
  name: string;
  nature: string;
  balance: number;
  currency_code: string;
  connection_id: string;
  created_at: string;
  updated_at: string;
  extra: {
    iban?: string;
    swift_code?: string;
    account_holder?: string;
    account_number?: string;
    sort_code?: string;
    routing_number?: string;
  };
}

export interface SaltEdgeTransaction {
  id: string;
  duplicated: boolean;
  mode: 'normal' | 'fee' | 'transfer';
  status: 'posted' | 'pending';
  made_on: string;
  amount: number;
  currency_code: string;
  description: string;
  category: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  extra: {
    account_balance_snapshot?: number;
    categorization_confidence?: number;
    merchant_id?: string;
    posting_date?: string;
    time?: string;
    type?: string;
    unit_price?: number;
    units?: number;
  };
}

export interface SaltEdgeProvider {
  id: string;
  code: string;
  name: string;
  mode: 'oauth' | 'web' | 'api';
  status: 'active' | 'inactive' | 'disabled';
  interactive: boolean;
  instruction: string;
  home_url: string;
  login_url: string;
  logo_url: string;
  country_code: string;
  created_at: string;
  updated_at: string;
  timezone: string;
  max_consent_days: number;
  max_interactive_delay: number;
  optional_interactivity: boolean;
  regulated: boolean;
  max_fetch_interval: number;
  supported_fetch_scopes: string[];
  supported_account_extra_fields: string[];
  supported_transaction_extra_fields: string[];
  supported_account_natures: string[];
  supported_account_types: string[];
  identification_mode: string;
  bic_codes: string[];
  supported_iframe_embedding: boolean;
  payment_templates: string[];
  supported_payment_fields: object;
  required_payment_fields: object;
}

export interface SaltEdgeWidgetSession {
  expires_at: string;
  connect_url: string;
}

export interface SaltEdgeError {
  error_class: string;
  error_message: string;
  request_id: string;
}

export class SaltEdgeClient {
  private config: SaltEdgeConfig;

  constructor(config: SaltEdgeConfig) {
    this.config = config;
  }

  // Utility method to generate signature for authenticated requests
  private generateSignature(
    method: string,
    url: string,
    body: string,
    expiresAt: string
  ): string {
    if (!this.config.privateKey) {
      throw new Error('Private key is required for signed requests');
    }

    const stringToSign = `${expiresAt}|${method}|${url}|${body}`;
    const sign = createSign('RSA-SHA256');
    sign.update(stringToSign);
    sign.end();
    
    return sign.sign(this.config.privateKey, 'base64');
  }

  // Utility method to make authenticated API requests
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      signed?: boolean;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, signed = false } = options;
    const url = `${this.config.baseUrl}${endpoint}`;
    const expiresAt = Math.floor(Date.now() / 1000) + 60; // +1 minute
    const bodyString = body ? JSON.stringify(body) : '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'App-id': this.config.appId,
      'Secret': this.config.secret,
    };

    if (signed) {
      headers['Expires-at'] = expiresAt.toString();
      headers['Signature'] = this.generateSignature(method, url, bodyString, expiresAt.toString());
    }

    const response = await fetch(url, {
      method,
      headers,
      body: bodyString || undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error_message || 
        `Salt Edge API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data || data;
  }

  // Get list of supported countries
  async getCountries(): Promise<any[]> {
    return this.makeRequest('/countries');
  }

  // Get list of providers (banks) for a specific country
  async getProviders(countryCode?: string): Promise<SaltEdgeProvider[]> {
    const query = countryCode ? `?country_code=${countryCode}` : '';
    return this.makeRequest(`/providers${query}`);
  }

  // Get popular French banks
  async getFrenchBanks(): Promise<SaltEdgeProvider[]> {
    const providers = await this.getProviders('FR');
    
    // Filter for popular French banks
    const popularBanks = [
      'bnp_paribas_fr',
      'credit_agricole_fr', 
      'societe_generale_fr',
      'lcl_fr',
      'credit_mutuel_fr',
      'banque_postale_fr',
      'revolut_fr',
      'boursorama_fr',
      'ing_fr',
      'hello_bank_fr'
    ];

    return providers.filter(provider => 
      popularBanks.some(bankCode => 
        provider.code.includes(bankCode.replace('_fr', '')) ||
        provider.name.toLowerCase().includes(bankCode.replace('_fr', '').replace('_', ' '))
      )
    );
  }

  // Create a new customer
  async createCustomer(identifier: string): Promise<SaltEdgeCustomer> {
    const body = {
      data: {
        identifier
      }
    };

    return this.makeRequest('/customers', {
      method: 'POST',
      body,
      signed: true
    });
  }

  // Get customer by ID
  async getCustomer(customerId: string): Promise<SaltEdgeCustomer> {
    return this.makeRequest(`/customers/${customerId}`, { signed: true });
  }

  // Create a connection widget session
  async createConnectionSession(data: {
    customer_id: string;
    provider_code?: string;
    consent: string[];
    attempt: {
      return_to: string;
      locale?: string;
      show_consent_confirmation?: boolean;
      credentials_strategy?: string;
    };
    widget?: {
      template?: string;
      theme?: string;
      javascript_callback_type?: string;
      show_consent_confirmation?: boolean;
      disable_provider_search?: boolean;
      popular_providers_country?: string;
    };
  }): Promise<SaltEdgeWidgetSession> {
    const body = { data };

    return this.makeRequest('/connections/connect', {
      method: 'POST',
      body,
      signed: true
    });
  }

  // Get connection details
  async getConnection(connectionId: string, include?: string[]): Promise<SaltEdgeConnection> {
    const query = include ? `?include=${include.join(',')}` : '';
    return this.makeRequest(`/connections/${connectionId}${query}`, { signed: true });
  }

  // Get customer connections
  async getCustomerConnections(customerId: string): Promise<SaltEdgeConnection[]> {
    return this.makeRequest(`/connections?customer_id=${customerId}`, { signed: true });
  }

  // Get accounts for a connection
  async getAccounts(connectionId: string): Promise<SaltEdgeAccount[]> {
    return this.makeRequest(`/accounts?connection_id=${connectionId}`, { signed: true });
  }

  // Get account details
  async getAccount(accountId: string): Promise<SaltEdgeAccount> {
    return this.makeRequest(`/accounts/${accountId}`, { signed: true });
  }

  // Get transactions for an account
  async getTransactions(
    accountId: string,
    options: {
      from_id?: string;
      per_page?: number;
      from_date?: string;
      to_date?: string;
      pending?: boolean;
      duplicated?: boolean;
    } = {}
  ): Promise<SaltEdgeTransaction[]> {
    const params = new URLSearchParams();
    params.append('account_id', accountId);
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.makeRequest(`/transactions?${params.toString()}`, { signed: true });
  }

  // Get all transactions for a connection
  async getConnectionTransactions(connectionId: string): Promise<SaltEdgeTransaction[]> {
    const accounts = await this.getAccounts(connectionId);
    const allTransactions: SaltEdgeTransaction[] = [];

    for (const account of accounts) {
      try {
        const transactions = await this.getTransactions(account.id, {
          per_page: 100
        });
        allTransactions.push(...transactions);
      } catch (error) {
        console.error(`Error fetching transactions for account ${account.id}:`, error);
      }
    }

    // Sort by date (most recent first)
    return allTransactions.sort((a, b) => 
      new Date(b.made_on).getTime() - new Date(a.made_on).getTime()
    );
  }

  // Refresh connection data
  async refreshConnection(connectionId: string, options: {
    attempt: {
      return_to: string;
      locale?: string;
      show_consent_confirmation?: boolean;
    };
    widget?: {
      template?: string;
      theme?: string;
      javascript_callback_type?: string;
    };
  }): Promise<SaltEdgeWidgetSession> {
    const body = { data: options };

    return this.makeRequest(`/connections/${connectionId}/refresh`, {
      method: 'POST',
      body,
      signed: true
    });
  }

  // Delete connection
  async deleteConnection(connectionId: string): Promise<{ removed: boolean }> {
    return this.makeRequest(`/connections/${connectionId}`, {
      method: 'DELETE',
      signed: true
    });
  }

  // Reconnect connection with new credentials
  async reconnectConnection(connectionId: string, options: {
    attempt: {
      return_to: string;
      locale?: string;
      show_consent_confirmation?: boolean;
      credentials_strategy?: string;
    };
    widget?: {
      template?: string;
      theme?: string;
      javascript_callback_type?: string;
    };
  }): Promise<SaltEdgeWidgetSession> {
    const body = { data: options };

    return this.makeRequest(`/connections/${connectionId}/reconnect`, {
      method: 'POST',
      body,
      signed: true
    });
  }

  // Format transaction data for display
  formatTransactionForDisplay(transaction: SaltEdgeTransaction): {
    id: string;
    date: string;
    description: string;
    amount: number;
    currency: string;
    type: 'credit' | 'debit';
    category: string;
    balance?: number;
  } {
    return {
      id: transaction.id,
      date: transaction.made_on,
      description: transaction.description,
      amount: Math.abs(transaction.amount),
      currency: transaction.currency_code,
      type: transaction.amount >= 0 ? 'credit' : 'debit',
      category: transaction.category,
      balance: transaction.extra.account_balance_snapshot
    };
  }

  // Format account data for display
  formatAccountForDisplay(account: SaltEdgeAccount): {
    id: string;
    name: string;
    balance: number;
    currency: string;
    type: string;
    iban?: string;
    accountNumber?: string;
  } {
    return {
      id: account.id,
      name: account.name,
      balance: account.balance,
      currency: account.currency_code,
      type: account.nature,
      iban: account.extra.iban,
      accountNumber: account.extra.account_number
    };
  }
}

// Helper function to create Salt Edge client instance
export function createSaltEdgeClient(config?: Partial<SaltEdgeConfig>): SaltEdgeClient {
  const saltEdgeConfig: SaltEdgeConfig = {
    appId: process.env.SALTEDGE_APP_ID || '',
    secret: process.env.SALTEDGE_SECRET || '',
    baseUrl: process.env.SALTEDGE_BASE_URL || 'https://www.saltedge.com/api/v6',
    publicKey: process.env.SALTEDGE_PUBLIC_KEY,
    privateKey: process.env.SALTEDGE_PRIVATE_KEY,
    ...config
  };

  if (!saltEdgeConfig.appId || !saltEdgeConfig.secret) {
    throw new Error('SALTEDGE_APP_ID and SALTEDGE_SECRET environment variables are required');
  }

  return new SaltEdgeClient(saltEdgeConfig);
}

// Lazy-loaded client instance to avoid initialization errors during build
let saltEdgeClientInstance: SaltEdgeClient | null = null;

export const saltEdgeClient = {
  getInstance(): SaltEdgeClient {
    if (!saltEdgeClientInstance) {
      saltEdgeClientInstance = createSaltEdgeClient();
    }
    return saltEdgeClientInstance;
  },

  // Proxy all methods to the lazy-loaded instance
  async getCountries() {
    return this.getInstance().getCountries();
  },

  async getProviders(countryCode?: string) {
    return this.getInstance().getProviders(countryCode);
  },

  async getFrenchBanks() {
    return this.getInstance().getFrenchBanks();
  },

  async createCustomer(identifier: string) {
    return this.getInstance().createCustomer(identifier);
  },

  async getCustomer(customerId: string) {
    return this.getInstance().getCustomer(customerId);
  },

  async createConnectionSession(data: any) {
    return this.getInstance().createConnectionSession(data);
  },

  async getConnection(connectionId: string, include?: string[]) {
    return this.getInstance().getConnection(connectionId, include);
  },

  async getCustomerConnections(customerId: string) {
    return this.getInstance().getCustomerConnections(customerId);
  },

  async getAccounts(connectionId: string) {
    return this.getInstance().getAccounts(connectionId);
  },

  async getAccount(accountId: string) {
    return this.getInstance().getAccount(accountId);
  },

  async getTransactions(accountId: string, options: any = {}) {
    return this.getInstance().getTransactions(accountId, options);
  },

  async getConnectionTransactions(connectionId: string) {
    return this.getInstance().getConnectionTransactions(connectionId);
  },

  async refreshConnection(connectionId: string, options: any) {
    return this.getInstance().refreshConnection(connectionId, options);
  },

  async deleteConnection(connectionId: string) {
    return this.getInstance().deleteConnection(connectionId);
  },

  async reconnectConnection(connectionId: string, options: any) {
    return this.getInstance().reconnectConnection(connectionId, options);
  },

  formatTransactionForDisplay(transaction: any) {
    return this.getInstance().formatTransactionForDisplay(transaction);
  },

  formatAccountForDisplay(account: any) {
    return this.getInstance().formatAccountForDisplay(account);
  }
};

// Constants for popular French banks
export const FRENCH_BANKS = [
  { code: 'revolut_fr', name: 'Revolut', logo: '🟣' },
  { code: 'bnp_paribas_fr', name: 'BNP Paribas', logo: '🏦' },
  { code: 'credit_agricole_fr', name: 'Crédit Agricole', logo: '🌾' },
  { code: 'societe_generale_fr', name: 'Société Générale', logo: '🔴' },
  { code: 'lcl_fr', name: 'LCL', logo: '💼' },
  { code: 'banque_postale_fr', name: 'La Banque Postale', logo: '📮' },
  { code: 'boursorama_fr', name: 'Boursorama', logo: '💰' },
  { code: 'ing_fr', name: 'ING Direct', logo: '🧡' },
  { code: 'hello_bank_fr', name: 'Hello Bank!', logo: '👋' },
  { code: 'credit_mutuel_fr', name: 'Crédit Mutuel', logo: '🤝' }
]; 