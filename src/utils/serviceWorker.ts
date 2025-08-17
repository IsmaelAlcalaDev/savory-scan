
// Service Worker registration and management

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig = {};

  async register(config: ServiceWorkerConfig = {}) {
    this.config = config;

    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      console.log('Registering Service Worker...');
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', this.registration);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (!newWorker) return;

        console.log('New Service Worker found');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New Service Worker installed, update available');
            this.config.onUpdate?.(this.registration!);
          }
        });
      });

      // Success callback
      this.config.onSuccess?.(this.registration);

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.config.onError?.(error as Error);
    }
  }

  async unregister() {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      this.registration = null;
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  async update() {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('Service Worker update triggered');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  async skipWaiting() {
    if (!this.registration?.waiting) return;

    // Send message to SW to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  private handleMessage(event: MessageEvent) {
    const { data } = event;
    
    switch (data?.type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', data.payload);
        break;
      case 'OFFLINE_READY':
        console.log('App ready for offline use');
        break;
      default:
        console.log('SW message:', data);
    }
  }

  // Cache management methods
  async clearCache(cacheName?: string) {
    if (!('caches' in window)) return false;

    try {
      if (cacheName) {
        return await caches.delete(cacheName);
      } else {
        const cacheNames = await caches.keys();
        const results = await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
        return results.every(result => result);
      }
    } catch (error) {
      console.error('Cache clear failed:', error);
      return false;
    }
  }

  async getCacheSize() {
    if (!('caches' in window)) return 0;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Cache size calculation failed:', error);
      return 0;
    }
  }

  // Network status
  get isOnline() {
    return navigator.onLine;
  }

  // Add network status listeners
  addNetworkListeners(
    onOnline: () => void,
    onOffline: () => void
  ) {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }
}

// Export singleton
export const serviceWorkerManager = new ServiceWorkerManager();

// Utility functions
export const registerSW = (config?: ServiceWorkerConfig) => {
  return serviceWorkerManager.register(config);
};

export const unregisterSW = () => {
  return serviceWorkerManager.unregister();
};

// Performance monitoring
export const getPerformanceMetrics = () => {
  if (!('performance' in window)) return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    // Core Web Vitals
    fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    lcp: 0, // Would need additional measurement
    fid: 0, // Would need additional measurement
    cls: 0, // Would need additional measurement
    
    // Navigation timing
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    
    // Network timing
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
    
    // Resource timing
    totalLoadTime: navigation.loadEventEnd - navigation.navigationStart
  };
};
