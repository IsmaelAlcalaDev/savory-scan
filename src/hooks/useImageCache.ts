
import { useEffect, useCallback, useRef } from 'react';

interface UseImageCacheProps {
  enabled?: boolean;
  preloadNextBatch?: boolean;
}

interface UseImageCacheReturn {
  preloadImages: (urls: string[]) => Promise<void>;
  clearCache: () => Promise<void>;
  isServiceWorkerReady: boolean;
}

export const useImageCache = ({ 
  enabled = true, 
  preloadNextBatch = true 
}: UseImageCacheProps = {}): UseImageCacheReturn => {
  const serviceWorkerRef = useRef<ServiceWorker | null>(null);
  const isServiceWorkerReady = useRef(false);

  // Register Service Worker
  useEffect(() => {
    if (!enabled || !('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Wait for service worker to be ready
        const serviceWorker = await navigator.serviceWorker.ready;
        serviceWorkerRef.current = serviceWorker.active;
        isServiceWorkerReady.current = true;
        
        console.log('Service Worker ready for image caching');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerSW();
  }, [enabled]);

  // Preload images function
  const preloadImages = useCallback(async (urls: string[]): Promise<void> => {
    if (!enabled || !isServiceWorkerReady.current || !serviceWorkerRef.current) {
      return;
    }

    try {
      // Filter valid image URLs
      const validUrls = urls.filter(url => 
        url && 
        typeof url === 'string' && 
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
      );

      if (validUrls.length === 0) return;

      // Send message to service worker to preload images
      serviceWorkerRef.current.postMessage({
        type: 'PRELOAD_IMAGES',
        urls: validUrls
      });

      console.log(`Preloading ${validUrls.length} images...`);
    } catch (error) {
      console.error('Failed to preload images:', error);
    }
  }, [enabled]);

  // Clear cache function
  const clearCache = useCallback(async (): Promise<void> => {
    if (!enabled || !isServiceWorkerReady.current || !serviceWorkerRef.current) {
      return;
    }

    try {
      serviceWorkerRef.current.postMessage({
        type: 'CLEAR_IMAGE_CACHE'
      });
      console.log('Image cache cleared');
    } catch (error) {
      console.error('Failed to clear image cache:', error);
    }
  }, [enabled]);

  return {
    preloadImages,
    clearCache,
    isServiceWorkerReady: isServiceWorkerReady.current
  };
};
