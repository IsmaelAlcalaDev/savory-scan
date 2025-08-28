
const CACHE_NAME = 'savory-scan-v1';
const STATIC_CACHE = 'static-v1';
const IMAGE_CACHE = 'images-v1';
const API_CACHE = 'api-v1';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/assets/index.css',
  '/assets/index.js',
  '/favicon.ico'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== API_CACHE
            )
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Detect potentially sensitive/authenticated requests
  const hasAuthHeader = request.headers.has('authorization') || request.headers.has('Authorization');
  const isApiRequest = url.hostname.includes('supabase.co') && url.pathname.includes('/rest/');

  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/assets/')) {
    // Static assets - Cache First
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/')) {
    // Images from Supabase - Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
  } else if (isApiRequest) {
    // API calls - Network First with short cache, but DO NOT cache authenticated responses
    const cacheResponses = !hasAuthHeader;
    event.respondWith(networkFirst(request, API_CACHE, 5000, cacheResponses)); // 5 second timeout
  } else if (url.origin === location.origin) {
    // Same-origin requests - Network First
    event.respondWith(networkFirst(request, CACHE_NAME));
  }
});

// Cache First Strategy - for static assets
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok && isResponseCacheable(response)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Cache First failed:', error);
    return new Response('Network error', { status: 408 });
  }
}

// Stale While Revalidate Strategy - for images
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok && isResponseCacheable(response)) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  // Return cached version immediately if available
  return cached || fetchPromise;
}

// Network First Strategy - for API calls and pages
async function networkFirst(request, cacheName, timeout = 3000, cacheResponse = true) {
  const cache = await caches.open(cacheName);
  
  try {
    // Try network first with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(request, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok && cacheResponse && isResponseCacheable(response)) {
      // Cache successful responses
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // If no cache available, return error
    console.error('Network First failed:', error);
    return new Response('Network error', { 
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Only cache responses that are safe to store
function isResponseCacheable(response) {
  const cacheControl = response.headers.get('Cache-Control') || '';
  // Avoid caching private or no-store responses
  if (/no-store|private/i.test(cacheControl)) return false;
  return true;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any offline actions that need to be synced
  console.log('Background sync triggered');
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    );
  }
});
