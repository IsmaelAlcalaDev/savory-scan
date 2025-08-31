
interface ImagePreloadOptions {
  priority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

interface PreloadedImage {
  url: string;
  loaded: boolean;
  error: boolean;
  element?: HTMLImageElement;
}

class OptimizedImagePreloader {
  private cache = new Map<string, PreloadedImage>();
  private loadingQueue: string[] = [];
  private maxConcurrent = 4;
  private currentLoading = 0;

  preloadImage(url: string, options: ImagePreloadOptions = {}): Promise<HTMLImageElement> {
    // Return cached result if available
    const cached = this.cache.get(url);
    if (cached) {
      if (cached.loaded && cached.element) {
        return Promise.resolve(cached.element);
      }
      if (cached.error) {
        return Promise.reject(new Error(`Failed to load image: ${url}`));
      }
    }

    return new Promise((resolve, reject) => {
      // Initialize cache entry
      if (!cached) {
        this.cache.set(url, { url, loaded: false, error: false });
      }

      const img = new Image();
      
      // Set loading attributes for optimization
      if (options.loading) {
        img.loading = options.loading;
      }
      
      // Set fetch priority for better resource prioritization
      if (options.fetchPriority && 'fetchPriority' in img) {
        (img as any).fetchPriority = options.fetchPriority;
      }

      img.onload = () => {
        const cacheEntry = this.cache.get(url)!;
        cacheEntry.loaded = true;
        cacheEntry.element = img;
        this.currentLoading--;
        this.processQueue();
        resolve(img);
      };

      img.onerror = () => {
        const cacheEntry = this.cache.get(url)!;
        cacheEntry.error = true;
        this.currentLoading--;
        this.processQueue();
        reject(new Error(`Failed to load image: ${url}`));
      };

      // Add to queue or start loading immediately
      if (this.currentLoading < this.maxConcurrent) {
        this.currentLoading++;
        img.src = url;
      } else {
        this.loadingQueue.push(url);
      }
    });
  }

  private processQueue() {
    while (this.loadingQueue.length > 0 && this.currentLoading < this.maxConcurrent) {
      const nextUrl = this.loadingQueue.shift()!;
      const cached = this.cache.get(nextUrl);
      
      if (cached && !cached.loaded && !cached.error) {
        this.currentLoading++;
        const img = new Image();
        
        img.onload = () => {
          cached.loaded = true;
          cached.element = img;
          this.currentLoading--;
          this.processQueue();
        };

        img.onerror = () => {
          cached.error = true;
          this.currentLoading--;
          this.processQueue();
        };

        img.src = nextUrl;
      }
    }
  }

  preloadRestaurantImages(restaurants: Array<{ cover_image_url?: string; logo_url?: string }>) {
    const urls: string[] = [];
    
    restaurants.forEach(restaurant => {
      if (restaurant.cover_image_url) {
        urls.push(restaurant.cover_image_url);
      }
      if (restaurant.logo_url) {
        urls.push(restaurant.logo_url);
      }
    });

    // Preload with high priority for above-the-fold images
    const promises = urls.slice(0, 6).map((url, index) => 
      this.preloadImage(url, {
        priority: index < 3 ? 'high' : 'auto',
        loading: 'eager',
        fetchPriority: index < 3 ? 'high' : 'auto'
      }).catch(error => {
        console.warn(`Failed to preload image ${url}:`, error);
        return null;
      })
    );

    // Preload remaining images with lower priority
    const lowPriorityPromises = urls.slice(6).map(url =>
      this.preloadImage(url, {
        priority: 'low',
        loading: 'lazy',
        fetchPriority: 'low'
      }).catch(error => {
        console.warn(`Failed to preload image ${url}:`, error);
        return null;
      })
    );

    return Promise.allSettled([...promises, ...lowPriorityPromises]);
  }

  clearCache() {
    this.cache.clear();
    this.loadingQueue = [];
    this.currentLoading = 0;
  }

  getCacheStats() {
    const total = this.cache.size;
    const loaded = Array.from(this.cache.values()).filter(img => img.loaded).length;
    const errors = Array.from(this.cache.values()).filter(img => img.error).length;
    
    return {
      total,
      loaded,
      errors,
      pending: total - loaded - errors,
      hitRate: total > 0 ? (loaded / total) * 100 : 0
    };
  }
}

// Export singleton instance
export const optimizedImagePreloader = new OptimizedImagePreloader();

// Legacy compatibility
export const preloadRestaurantImages = (restaurants: Array<{ cover_image_url?: string; logo_url?: string }>) => {
  return optimizedImagePreloader.preloadRestaurantImages(restaurants);
};
