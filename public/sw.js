
const CACHE_NAME = 'foodie-images-v1';
const IMAGE_CACHE_NAME = 'foodie-images-store-v1';

// Install event - setup cache
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - intelligent image caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle image requests
  if (request.destination === 'image' || 
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)) {
    
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached image immediately
            return cachedResponse;
          }
          
          // Fetch and cache new image
          return fetch(request).then((response) => {
            if (response.ok) {
              // Clone response before caching
              const responseToCache = response.clone();
              cache.put(request, responseToCache);
            }
            return response;
          }).catch((error) => {
            console.log('Image fetch failed:', error);
            // Return a placeholder or offline image if available
            return new Response(
              '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af">Imagen no disponible</text></svg>',
              {
                headers: {
                  'Content-Type': 'image/svg+xml',
                  'Cache-Control': 'no-cache'
                }
              }
            );
          });
        });
      })
    );
  }
});

// Message event - handle cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_IMAGES') {
    const imageUrls = event.data.urls;
    preloadImages(imageUrls);
  }
  
  if (event.data && event.data.type === 'CLEAR_IMAGE_CACHE') {
    clearImageCache();
  }
});

// Preload images function
async function preloadImages(urls) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const preloadPromises = urls.map((url) => {
    return fetch(url).then((response) => {
      if (response.ok) {
        return cache.put(url, response.clone());
      }
    }).catch((error) => {
      console.log('Preload failed for:', url, error);
    });
  });
  
  await Promise.allSettled(preloadPromises);
  console.log('Preloaded', urls.length, 'images');
}

// Clear image cache function
async function clearImageCache() {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const keys = await cache.keys();
  await Promise.all(keys.map(key => cache.delete(key)));
  console.log('Image cache cleared');
}
