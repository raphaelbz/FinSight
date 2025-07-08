// FinSight Service Worker v1.0
// PWA et optimisations de performance

const CACHE_NAME = 'finsight-v1'
const DYNAMIC_CACHE = 'finsight-dynamic-v1'
const STATIC_CACHE = 'finsight-static-v1'

// Ressources critiques à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/offline.html',
  '/_next/static/css/',
  '/_next/static/js/',
]

// URLs d'API à mettre en cache avec stratégie Network First
const API_CACHE_PATTERNS = [
  '/api/auth/',
  '/api/saltedge/',
  '/api/revolut/',
  '/api/gocardless/'
]

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache des ressources statiques
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => url));
      }),
      
      // Préchargement intelligent
      preloadCriticalResources()
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Nettoyage des anciens caches
      cleanupOldCaches(),
      
      // Prise de contrôle immédiate
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated');
    })
  );
});

// Interception des requêtes - Stratégies de cache intelligentes
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) return;
  
  // Stratégie basée sur le type de ressource
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigation(request));
  } else {
    event.respondWith(handleDynamic(request));
  }
});

// Gestion des ressources statiques - Cache First
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('🔥 Failed to fetch static asset:', request.url);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Gestion des requêtes API - Network First avec fallback
async function handleApiRequest(request) {
  try {
    // Essayer le réseau en premier pour les données fraîches
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Mettre en cache les réponses réussies (sauf pour les mutations)
      if (request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // Fallback vers le cache pour les requêtes GET
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('📱 Serving API response from cache:', request.url);
        return cachedResponse;
      }
    }
    
    // Réponse d'erreur personnalisée
    return new Response(
      JSON.stringify({
        error: 'Service unavailable offline',
        cached: false,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Gestion de la navigation - Cache avec fallback vers /offline.html
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }
    throw new Error('Network error');
  } catch (error) {
    // Essayer le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback vers la page offline
    return caches.match('/offline.html');
  }
}

// Gestion des ressources dynamiques - Stale While Revalidate
async function handleDynamic(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Utilitaires de détection
function isStaticAsset(url) {
  return url.pathname.includes('/_next/') ||
         url.pathname.includes('/static/') ||
         url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/);
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') ||
         API_CACHE_PATTERNS.some(pattern => url.pathname.includes(pattern));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Préchargement des ressources critiques
async function preloadCriticalResources() {
  try {
    const criticalUrls = [
      '/api/auth/session',
      '/_next/static/css/app.css',
    ];
    
    await Promise.allSettled(
      criticalUrls.map(url => fetch(url).catch(() => null))
    );
    
    console.log('🚀 Critical resources preloaded');
  } catch (error) {
    console.warn('⚠️ Failed to preload some critical resources');
  }
}

// Nettoyage des anciens caches
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name !== CACHE_NAME && 
    name !== DYNAMIC_CACHE && 
    name !== STATIC_CACHE
  );
  
  await Promise.all(
    oldCaches.map(cacheName => caches.delete(cacheName))
  );
  
  if (oldCaches.length > 0) {
    console.log('🧹 Cleaned up old caches:', oldCaches);
  }
}

// Synchronisation en arrière-plan pour les données bancaires
self.addEventListener('sync', event => {
  if (event.tag === 'bank-data-sync') {
    event.waitUntil(syncBankData());
  }
});

async function syncBankData() {
  try {
    console.log('🔄 Background sync: Refreshing bank data...');
    
    // Récupérer les connexions actives
    const response = await fetch('/api/sync/bank-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('✅ Bank data synchronized successfully');
      
      // Notifier les clients connectés
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'BANK_DATA_UPDATED',
          timestamp: new Date().toISOString()
        });
      });
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Notifications push pour les alertes financières
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nouvelle notification FinSight',
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      tag: data.tag || 'finsight-notification',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Voir',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Ignorer',
          icon: '/icons/dismiss.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'FinSight', options)
    );
  } catch (error) {
    console.error('❌ Push notification error:', error);
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'view') {
    event.waitUntil(
      clients.openWindow(data.url || '/dashboard')
    );
  }
});

// Monitoring des performances
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
    console.log('📊 Performance metrics:', event.data.metrics);
  }
});

console.log('🚀 FinSight Service Worker loaded successfully'); 