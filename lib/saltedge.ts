// Salt Edge API Integration for FinSight
// Supports 2,500+ banks in 50+ countries including France and Revolut

import { createHash, createSign } from 'crypto';

// Test tracking for pending mode
interface TestTracker {
  totalTests: number;
  usedTests: number;
  testHistory: Array<{
    timestamp: string;
    action: string;
    provider?: string;
    success: boolean;
  }>;
}

let testTracker: TestTracker = {
  totalTests: 10,
  usedTests: 0,
  testHistory: []
};

export function getTestStatus() {
  return {
    ...testTracker,
    remainingTests: testTracker.totalTests - testTracker.usedTests
  };
}

export function recordTestUsage(action: string, provider?: string, success: boolean = true) {
  if (testTracker.usedTests < testTracker.totalTests) {
    testTracker.usedTests++;
    testTracker.testHistory.push({
      timestamp: new Date().toISOString(),
      action,
      provider,
      success
    });
  }
  return getTestStatus();
}

export function resetTestCounter() {
  testTracker = {
    totalTests: 10,
    usedTests: 0,
    testHistory: []
  };
}

// Rate limiting pour éviter de dépasser les limites de l'API
interface RateLimitTracker {
  requests: number;
  resetTime: number;
  lastRequest: number;
}

let rateLimitTracker: RateLimitTracker = {
  requests: 0,
  resetTime: Date.now() + 60000, // Reset chaque minute
  lastRequest: 0
};

// Cache pour les customers Salt Edge pour éviter les doublons
interface CustomerCache {
  [identifier: string]: {
    customer: SaltEdgeCustomer;
    created: number;
    ttl: number; // Time to live en ms
  };
}

let customerCache: CustomerCache = {};

// Fonction pour vérifier et respecter les limites de rate
export function checkRateLimit(): { allowed: boolean; waitTime?: number } {
  const now = Date.now();
  
  // Reset du compteur si nécessaire
  if (now >= rateLimitTracker.resetTime) {
    rateLimitTracker.requests = 0;
    rateLimitTracker.resetTime = now + 60000; // Prochain reset dans 1 minute
  }

  // En mode pending, limiter à 15 requêtes par minute
  const maxRequests = process.env.SALTEDGE_STATUS === 'pending' ? 15 : 50;
  
  if (rateLimitTracker.requests >= maxRequests) {
    const waitTime = rateLimitTracker.resetTime - now;
    console.warn(`⚠️ Rate limit atteint (${rateLimitTracker.requests}/${maxRequests}). Attendre ${Math.ceil(waitTime / 1000)}s`);
    return { allowed: false, waitTime };
  }

  // Minimum 100ms entre les requêtes pour éviter le spam
  const timeSinceLastRequest = now - rateLimitTracker.lastRequest;
  if (timeSinceLastRequest < 100) {
    return { allowed: false, waitTime: 100 - timeSinceLastRequest };
  }

  return { allowed: true };
}

export function recordApiRequest() {
  rateLimitTracker.requests++;
  rateLimitTracker.lastRequest = Date.now();
}

// Fonction pour gérer intelligemment les customers
export function getCachedCustomer(identifier: string): SaltEdgeCustomer | null {
  const cached = customerCache[identifier];
  if (!cached) return null;

  const now = Date.now();
  if (now > cached.created + cached.ttl) {
    // Cache expiré, nettoyer
    delete customerCache[identifier];
    return null;
  }

  console.log(`✅ Customer récupéré du cache: ${identifier}`);
  return cached.customer;
}

export function setCachedCustomer(identifier: string, customer: SaltEdgeCustomer, ttlHours: number = 24) {
  customerCache[identifier] = {
    customer,
    created: Date.now(),
    ttl: ttlHours * 60 * 60 * 1000 // TTL en millisecondes
  };
  console.log(`💾 Customer mis en cache: ${identifier} (TTL: ${ttlHours}h)`);
}

export function clearCustomerCache() {
  customerCache = {};
  console.log('🧹 Cache des customers vidé');
}

// Système de logs structurés pour Salt Edge
interface SaltEdgeLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  action: string;
  endpoint?: string;
  method?: string;
  duration?: number;
  status?: 'success' | 'error' | 'pending';
  details?: any;
  error?: string;
}

let logHistory: SaltEdgeLogEntry[] = [];

export function logSaltEdgeAction(entry: Omit<SaltEdgeLogEntry, 'timestamp' | 'level'> & { level?: 'info' | 'warn' | 'error' | 'debug' }) {
  const logEntry: SaltEdgeLogEntry = {
    ...entry,
    level: entry.level || 'info',
    timestamp: new Date().toISOString()
  };
  
  logHistory.push(logEntry);
  
  // Garder seulement les 100 derniers logs pour éviter l'overflow
  if (logHistory.length > 100) {
    logHistory = logHistory.slice(-100);
  }

  // Affichage console avec emojis pour faciliter le debug
  const emoji = entry.level === 'error' ? '❌' : 
                entry.level === 'warn' ? '⚠️' : 
                entry.level === 'debug' ? '🔍' : '📋';
  
  const message = `${emoji} [Salt Edge] ${entry.action}`;
  const details = entry.details ? ` - ${JSON.stringify(entry.details)}` : '';
  const duration = entry.duration ? ` (${entry.duration}ms)` : '';
  
  console.log(`${message}${duration}${details}`);
  
  if (entry.error) {
    console.error(`   └─ Error: ${entry.error}`);
  }
}

export function getSaltEdgeLogs(filter?: {
  level?: string;
  action?: string;
  lastN?: number;
}): SaltEdgeLogEntry[] {
  let filtered = logHistory;
  
  if (filter?.level) {
    filtered = filtered.filter(log => log.level === filter.level);
  }
  
  if (filter?.action) {
    filtered = filtered.filter(log => log.action.includes(filter.action!));
  }
  
  if (filter?.lastN) {
    filtered = filtered.slice(-filter.lastN);
  }
  
  return filtered;
}

export function clearSaltEdgeLogs() {
  logHistory = [];
  console.log('🧹 Historique des logs Salt Edge vidé');
}

// Métriques de performance pour Salt Edge
interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  responseTimes: number[];
}

let performanceMetrics: PerformanceMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  responseTimes: []
};

export function recordApiPerformance(duration: number, success: boolean) {
  performanceMetrics.totalRequests++;
  performanceMetrics.responseTimes.push(duration);
  
  if (success) {
    performanceMetrics.successfulRequests++;
  } else {
    performanceMetrics.failedRequests++;
  }
  
  // Garder seulement les 50 derniers temps de réponse
  if (performanceMetrics.responseTimes.length > 50) {
    performanceMetrics.responseTimes = performanceMetrics.responseTimes.slice(-50);
  }
  
  // Calculer la moyenne
  performanceMetrics.averageResponseTime = 
    performanceMetrics.responseTimes.reduce((a, b) => a + b, 0) / 
    performanceMetrics.responseTimes.length;
}

export function getPerformanceMetrics() {
  return {
    ...performanceMetrics,
    successRate: performanceMetrics.totalRequests > 0 ? 
      (performanceMetrics.successfulRequests / performanceMetrics.totalRequests) * 100 : 0
  };
}

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

// Interface pour la gestion d'erreurs améliorée
export interface SaltEdgeApiError {
  code: string;
  message: string;
  userMessage: string;
  details?: any;
  retryable: boolean;
}

// Fonction pour convertir les erreurs Salt Edge en format unifié
export function parseSaltEdgeError(error: any): SaltEdgeApiError {
  // Priorité 1: Données Salt Edge préservées par makeRequest
  if (error.saltEdgeError) {
    const saltEdgeData = error.saltEdgeError;
    
    // Format Salt Edge v6
    if (saltEdgeData.error) {
      const { class: error_class, message: error_message } = saltEdgeData.error;
      
      switch (error_class) {
        case 'DuplicatedCustomer':
          return {
            code: 'DUPLICATE_CUSTOMER',
            message: error_message,
            userMessage: 'Profil utilisateur déjà existant (géré automatiquement)',
            retryable: false
          };
          
        case 'CustomerNotFound':
          return {
            code: 'CUSTOMER_NOT_FOUND',
            message: error_message,
            userMessage: 'Profil utilisateur introuvable. Veuillez recréer votre connexion.',
            retryable: false
          };
          
        case 'ProviderNotFound':
          return {
            code: 'PROVIDER_NOT_FOUND',
            message: error_message,
            userMessage: 'Banque non supportée. Veuillez choisir une autre banque.',
            retryable: false
          };
          
        case 'RateLimitExceeded':
          return {
            code: 'RATE_LIMIT',
            message: error_message,
            userMessage: 'Trop de tentatives. Veuillez patienter quelques minutes.',
            retryable: true
          };
          
        case 'ApiKeyNotFound':
          return {
            code: 'INVALID_CREDENTIALS',
            message: error_message,
            userMessage: 'Identifiants API invalides. Vérifiez votre configuration.',
            retryable: false
          };
          
        default:
          return {
            code: 'UNKNOWN_SALT_EDGE_ERROR',
            message: error_message || 'Unknown Salt Edge error',
            userMessage: 'Erreur inattendue du service bancaire. Contactez le support.',
            retryable: false,
            details: { error_class, error_message }
          };
      }
    }
  }
  
  // Erreur de réseau ou de configuration
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return {
      code: 'NETWORK_ERROR',
      message: 'Connection to Salt Edge API failed',
      userMessage: 'Impossible de se connecter au service bancaire. Veuillez réessayer.',
      retryable: true
    };
  }

  // Erreurs HTTP avec réponse Salt Edge (format v6)
  if (error.error) {
    const { class: error_class, message: error_message } = error.error;
    
    switch (error_class) {
      case 'DuplicatedCustomer':
        return {
          code: 'DUPLICATE_CUSTOMER',
          message: error_message,
          userMessage: 'Profil utilisateur déjà existant (géré automatiquement)',
          retryable: false
        };
        
      case 'CustomerNotFound':
        return {
          code: 'CUSTOMER_NOT_FOUND',
          message: error_message,
          userMessage: 'Profil utilisateur introuvable. Veuillez recréer votre connexion.',
          retryable: false
        };
        
      case 'ConnectionNotFound':
        return {
          code: 'CONNECTION_NOT_FOUND',
          message: error_message,
          userMessage: 'Connexion bancaire introuvable. Veuillez vous reconnecter.',
          retryable: false
        };
        
      case 'ProviderNotFound':
        return {
          code: 'PROVIDER_NOT_FOUND',
          message: error_message,
          userMessage: 'Banque non supportée. Veuillez choisir une autre banque.',
          retryable: false
        };
        
      case 'ProviderDisabled':
        return {
          code: 'PROVIDER_DISABLED',
          message: error_message,
          userMessage: 'Cette banque est temporairement indisponible. Essayez une autre banque.',
          retryable: true
        };
        
      case 'InvalidCredentials':
        return {
          code: 'INVALID_CREDENTIALS',
          message: error_message,
          userMessage: 'Identifiants bancaires incorrects. Vérifiez vos informations.',
          retryable: true
        };
        
      case 'ConnectionFailed':
        return {
          code: 'CONNECTION_FAILED',
          message: error_message,
          userMessage: 'Échec de la connexion bancaire. Vérifiez vos identifiants.',
          retryable: true
        };
        
      case 'SessionExpired':
        return {
          code: 'SESSION_EXPIRED',
          message: error_message,
          userMessage: 'Session expirée. Veuillez recommencer la connexion.',
          retryable: true
        };
        
      case 'RateLimitExceeded':
        return {
          code: 'RATE_LIMIT',
          message: error_message,
          userMessage: 'Trop de tentatives. Veuillez patienter quelques minutes.',
          retryable: true
        };
        
      case 'MaintenanceMode':
        return {
          code: 'MAINTENANCE',
          message: error_message,
          userMessage: 'Service en maintenance. Veuillez réessayer plus tard.',
          retryable: true
        };
        
      default:
        return {
          code: 'UNKNOWN_SALT_EDGE_ERROR',
          message: error_message || 'Unknown Salt Edge error',
          userMessage: 'Erreur inattendue du service bancaire. Contactez le support.',
          retryable: false,
          details: { error_class, error_message }
        };
    }
  }

  // Fallback: Erreurs HTTP avec réponse Salt Edge (ancien format v5)
  if (error.response && error.response.data) {
    const { error_class, error_message } = error.response.data;
    
    switch (error_class) {
      case 'DuplicatedCustomer':
        return {
          code: 'DUPLICATE_CUSTOMER',
          message: error_message,
          userMessage: 'Profil utilisateur déjà existant (géré automatiquement)',
          retryable: false
        };
        
      default:
        return {
          code: 'UNKNOWN_SALT_EDGE_ERROR',
          message: error_message || 'Unknown Salt Edge error (v5)',
          userMessage: 'Erreur inattendue du service bancaire. Contactez le support.',
          retryable: false,
          details: { error_class, error_message }
        };
    }
  }

  // Erreurs HTTP sans détails Salt Edge
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return {
          code: 'BAD_REQUEST',
          message: 'Invalid request parameters',
          userMessage: 'Paramètres de requête invalides. Veuillez réessayer.',
          retryable: false
        };
        
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: 'Authentication failed',
          userMessage: 'Authentification échouée. Vérifiez la configuration.',
          retryable: false
        };
        
      case 403:
        return {
          code: 'FORBIDDEN',
          message: 'Access denied',
          userMessage: 'Accès refusé. Vérifiez vos permissions.',
          retryable: false
        };
        
      case 404:
        return {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          userMessage: 'Ressource introuvable.',
          retryable: false
        };
        
      case 429:
        return {
          code: 'RATE_LIMIT',
          message: 'Rate limit exceeded',
          userMessage: 'Trop de requêtes. Veuillez patienter.',
          retryable: true
        };
        
      case 500:
        return {
          code: 'SERVER_ERROR',
          message: 'Internal server error',
          userMessage: 'Erreur serveur temporaire. Veuillez réessayer.',
          retryable: true
        };
        
      default:
        return {
          code: 'HTTP_ERROR',
          message: `HTTP ${status} error`,
          userMessage: 'Erreur de communication. Veuillez réessayer.',
          retryable: true
        };
    }
  }

  // Erreur générique
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'Unknown error',
    userMessage: 'Erreur inattendue. Veuillez réessayer ou contactez le support.',
    retryable: false,
    details: error
  };
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
      console.warn('⚠️ Private key not configured - skipping signature for pending mode');
      return '';
    }

    const stringToSign = `${expiresAt}|${method}|${url}|${body}`;
    const sign = createSign('RSA-SHA256');
    sign.update(stringToSign);
    sign.end();
    
    return sign.sign(this.config.privateKey, 'base64');
  }

  // Méthode privée avec gestion du rate limiting
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      signed?: boolean;
    } = {}
  ): Promise<T> {
    // Vérifier le rate limiting
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      if (rateLimitCheck.waitTime) {
        console.log(`⏳ Attente de ${rateLimitCheck.waitTime}ms pour respecter le rate limit`);
        await new Promise(resolve => setTimeout(resolve, rateLimitCheck.waitTime));
      }
      // Re-vérifier après l'attente
      const secondCheck = checkRateLimit();
      if (!secondCheck.allowed) {
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
      }
    }

    // Enregistrer la requête
    recordApiRequest();

    const { method = 'GET', body, signed = false } = options;
    const bodyString = body ? JSON.stringify(body) : '';
    const url = `${this.config.baseUrl}${endpoint}`;
    const expiresAt = Math.floor(Date.now() / 1000) + 60; // +1 minute

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'App-id': this.config.appId,
      'Secret': this.config.secret,
    };

    if (signed && this.config.privateKey) {
      headers['Expires-at'] = expiresAt.toString();
      const signature = this.generateSignature(method, url, bodyString, expiresAt.toString());
      if (signature) {
        headers['Signature'] = signature;
      }
    }

    // Track API calls for test mode
    console.log(`🔄 Salt Edge API Call: ${method} ${endpoint}`);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method,
      headers,
      body: bodyString || undefined,
    });
    const endTime = Date.now();
    const duration = endTime - startTime;
    recordApiPerformance(duration, response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`❌ Salt Edge API Error: ${response.status}`, errorData);
      
      // Créer une erreur qui préserve les détails Salt Edge
      const error = new Error(
        errorData?.error?.message || 
        errorData?.error_message || 
        `Salt Edge API error: ${response.status} ${response.statusText}`
      );
      
      // Ajouter les détails Salt Edge à l'erreur pour les préserver
      (error as any).saltEdgeError = errorData;
      (error as any).status = response.status;
      
      throw error;
    }

    const data = await response.json();
    console.log(`✅ Salt Edge API Success: ${method} ${endpoint}`);
    return data.data || data;
  }

  // Get list of supported countries
  async getCountries(): Promise<any[]> {
    logSaltEdgeAction({ action: 'getCountries', method: 'GET', endpoint: '/countries' });
    return this.makeRequest('/countries');
  }

  // Get list of providers (banks) for a specific country
  async getProviders(countryCode?: string): Promise<SaltEdgeProvider[]> {
    const query = countryCode ? `?country_code=${countryCode}` : '';
    logSaltEdgeAction({ action: 'getProviders', method: 'GET', endpoint: `/providers${query}` });
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

  // Méthode améliorée pour créer ou récupérer un customer
  async createCustomer(identifier: string): Promise<SaltEdgeCustomer> {
    // Vérifier d'abord le cache
    const cachedCustomer = getCachedCustomer(identifier);
    if (cachedCustomer) {
      return cachedCustomer;
    }

    try {
      logSaltEdgeAction({ action: 'createCustomer', method: 'POST', endpoint: '/customers', details: { identifier } });
      const customer = await this.makeRequest<SaltEdgeCustomer>('/customers', {
        method: 'POST',
        body: { 
          data: {
            identifier 
          }
        },
        signed: true
      });

      // Mettre en cache le customer créé
      setCachedCustomer(identifier, customer, 24);
      
      return customer;
    } catch (error: any) {
      const errorInfo = parseSaltEdgeError(error);
      
      if (errorInfo.code === 'DUPLICATE_CUSTOMER') {
        console.log(`📝 Customer ${identifier} existe déjà. Création d'un nouvel identifier unique...`);
        
        // Salt Edge ne permet pas de récupérer un customer par identifier existant
        // Donc on crée un nouvel identifier unique pour éviter les conflits
        const timestamp = Date.now();
        const uniqueIdentifier = `${identifier}_${timestamp}`;
        
        console.log(`🔄 Nouvel identifier: ${uniqueIdentifier}`);
        
        try {
          logSaltEdgeAction({ 
            action: 'createCustomer', 
            method: 'POST', 
            endpoint: '/customers', 
            details: { originalIdentifier: identifier, newIdentifier: uniqueIdentifier },
            level: 'info'
          });
          
          const customer = await this.makeRequest<SaltEdgeCustomer>('/customers', {
            method: 'POST',
            body: { 
              data: {
                identifier: uniqueIdentifier 
              }
            },
            signed: true
          });

          // Mettre en cache avec l'identifier original pour la cohérence
          setCachedCustomer(identifier, customer, 24);
          
          console.log(`✅ Customer créé avec succès: ${customer.id}`);
          return customer;
          
        } catch (retryError: any) {
          console.error('❌ Échec de la création du customer unique:', retryError);
          throw new Error(`Impossible de créer le customer après conflit de doublon: ${retryError?.message || 'Unknown error'}`);
        }
      }
      
      // Relancer l'erreur parsée avec un message plus clair
      throw new Error(`Salt Edge Error [${errorInfo.code}]: ${errorInfo.userMessage}`);
    }
  }

  // Get customer by ID
  async getCustomer(customerId: string): Promise<SaltEdgeCustomer> {
    logSaltEdgeAction({ action: 'getCustomer', method: 'GET', endpoint: `/customers/${customerId}` });
    return this.makeRequest(`/customers/${customerId}`, { signed: true });
  }

  // Create connection session (Updated for Salt Edge API v6)
  // Note: Migrated from v5 to v6 API structure:
  // - Endpoint: /connections/connect (was /connect_sessions/create in v5)
  // - Consent: Separated into 'consent' (PSD2) and 'fetch' (data types)
  // - Base URL: https://www.saltedge.com/api/v6 (was v5)
  async createConnectionSession(data: {
    customer_id: string;
    provider_code?: string;
    consent: any; // Changed from string[] to any
    attempt: {
      return_to: string;
      locale?: string;
      show_consent_confirmation?: boolean;
      credentials_strategy?: string;
      fetch_scopes?: string[];
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

    logSaltEdgeAction({ action: 'createConnectionSession', method: 'POST', endpoint: '/connections/connect', details: { customer_id: data.customer_id, provider_code: data.provider_code } });
    return this.makeRequest('/connections/connect', {
      method: 'POST',
      body,
      signed: false  // Signatures optionnelles en mode pending
    });
  }

  // Get connection details
  async getConnection(connectionId: string, include?: string[]): Promise<SaltEdgeConnection> {
    const query = include ? `?include=${include.join(',')}` : '';
    logSaltEdgeAction({ action: 'getConnection', method: 'GET', endpoint: `/connections/${connectionId}${query}` });
    return this.makeRequest(`/connections/${connectionId}${query}`, { signed: false });
  }

  // Get customer connections
  async getCustomerConnections(customerId: string): Promise<SaltEdgeConnection[]> {
    logSaltEdgeAction({ action: 'getCustomerConnections', method: 'GET', endpoint: `/connections?customer_id=${customerId}` });
    return this.makeRequest(`/connections?customer_id=${customerId}`, { signed: true });
  }

  // Get accounts for a connection
  async getAccounts(connectionId: string): Promise<SaltEdgeAccount[]> {
    logSaltEdgeAction({ action: 'getAccounts', method: 'GET', endpoint: `/accounts?connection_id=${connectionId}` });
    return this.makeRequest(`/accounts?connection_id=${connectionId}`, { signed: false });
  }

  // Get account details
  async getAccount(accountId: string): Promise<SaltEdgeAccount> {
    logSaltEdgeAction({ action: 'getAccount', method: 'GET', endpoint: `/accounts/${accountId}` });
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

    logSaltEdgeAction({ action: 'getTransactions', method: 'GET', endpoint: `/transactions?${params.toString()}` });
    return this.makeRequest(`/transactions?${params.toString()}`, { signed: false });
  }

  // Get all transactions for a connection
  async getConnectionTransactions(connectionId: string): Promise<SaltEdgeTransaction[]> {
    logSaltEdgeAction({ action: 'getConnectionTransactions', method: 'GET', endpoint: `/connections/${connectionId}/transactions` });
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
    logSaltEdgeAction({ action: 'refreshConnection', method: 'POST', endpoint: `/connections/${connectionId}/refresh`, details: { connectionId, return_to: options.attempt.return_to } });
    return this.makeRequest(`/connections/${connectionId}/refresh`, {
      method: 'POST',
      body,
      signed: true
    });
  }

  // Delete connection
  async deleteConnection(connectionId: string): Promise<{ removed: boolean }> {
    logSaltEdgeAction({ action: 'deleteConnection', method: 'DELETE', endpoint: `/connections/${connectionId}` });
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
    logSaltEdgeAction({ action: 'reconnectConnection', method: 'POST', endpoint: `/connections/${connectionId}/reconnect`, details: { connectionId, return_to: options.attempt.return_to } });
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
  const rawBaseUrl = process.env.SALTEDGE_BASE_URL || 'https://www.saltedge.com/api/v6';
  const correctedBaseUrl = rawBaseUrl.includes('/api/v5')
    ? (() => {
        console.warn('⚠️ SALTEDGE_BASE_URL points to API v5 – automatically switching to API v6 to avoid 404 errors. Please update your environment configuration.');
        return rawBaseUrl.replace('/api/v5', '/api/v6');
      })()
    : rawBaseUrl;

  // Ensure the base URL explicitly targets API v6 (avoids 404 when `/api/v6` is missing)
  const baseWithVersion = /\/api\/v\d+/i.test(correctedBaseUrl)
    ? correctedBaseUrl
    : `${correctedBaseUrl.replace(/\/+$/, '')}/api/v6`;

  const saltEdgeConfig: SaltEdgeConfig = {
    appId: process.env.SALTEDGE_APP_ID || '',
    secret: process.env.SALTEDGE_SECRET || '',
    baseUrl: baseWithVersion,
    publicKey: process.env.SALTEDGE_PUBLIC_KEY,
    privateKey: process.env.SALTEDGE_PRIVATE_KEY,
    ...config
  };

  // Debug logs pour la configuration
  console.log('🔧 Salt Edge Configuration:', {
    appId: saltEdgeConfig.appId ? `${saltEdgeConfig.appId.substring(0, 10)}...` : 'MISSING',
    secret: saltEdgeConfig.secret ? `${saltEdgeConfig.secret.substring(0, 10)}...` : 'MISSING',
    baseUrl: saltEdgeConfig.baseUrl,
    hasPrivateKey: !!saltEdgeConfig.privateKey,
    mode: saltEdgeConfig.privateKey ? 'production' : 'pending'
  });

  if (!saltEdgeConfig.appId || !saltEdgeConfig.secret) {
    const error = 'SALTEDGE_APP_ID and SALTEDGE_SECRET environment variables are required';
    console.error('❌ Salt Edge Configuration Error:', error);
    throw new Error(error);
  }

  if (!saltEdgeConfig.privateKey) {
    console.warn('⚠️ Salt Edge running in pending mode (no private key) - signatures disabled');
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