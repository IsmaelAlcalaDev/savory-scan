
interface PreloadOptions {
  priority?: boolean;
  sizes?: string;
  type?: 'image/webp' | 'image/avif' | 'image/jpeg' | 'image/png';
}

class ImagePreloader {
  private preloadedImages = new Set<string>();
  private preloadQueue: Array<{ src: string; options: PreloadOptions }> = [];
  private isProcessing = false;

  /**
   * Preload a single image with optional format conversion
   */
  preload(src: string, options: PreloadOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        this.preloadedImages.add(src);
        
        // Also add to browser cache via link preload for better caching
        if (options.priority) {
          this.addPreloadLink(src, options);
        }
        
        resolve();
      };
      
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`);
        reject(new Error(`Failed to preload image: ${src}`));
      };
      
      img.src = src;
    });
  }

  /**
   * Add a preload link to document head for critical resources
   */
  private addPreloadLink(src: string, options: PreloadOptions) {
    const existingLink = document.querySelector(`link[href="${src}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (options.type) {
      link.type = options.type;
    }
    
    if (options.sizes) {
      link.setAttribute('imagesizes', options.sizes);
    }
    
    document.head.appendChild(link);
  }

  /**
   * Preload multiple images with priority queue
   */
  preloadBatch(images: Array<{ src: string; options?: PreloadOptions }>): Promise<void[]> {
    const promises = images.map(({ src, options = {} }) => 
      this.preload(src, options).catch(error => {
        console.warn(`Batch preload failed for ${src}:`, error);
        return Promise.resolve(); // Don't fail the entire batch
      })
    );
    
    return Promise.all(promises);
  }

  /**
   * Queue images for lazy preloading (non-blocking)
   */
  queuePreload(src: string, options: PreloadOptions = {}) {
    this.preloadQueue.push({ src, options });
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process the preload queue with requestIdleCallback for better performance
   */
  private async processQueue() {
    if (this.isProcessing || this.preloadQueue.length === 0) return;
    
    this.isProcessing = true;
    
    const processNext = () => {
      if (this.preloadQueue.length === 0) {
        this.isProcessing = false;
        return;
      }
      
      const { src, options } = this.preloadQueue.shift()!;
      
      this.preload(src, options)
        .catch(error => console.warn('Queue preload failed:', error))
        .finally(() => {
          // Use requestIdleCallback if available, otherwise setTimeout
          if ('requestIdleCallback' in window) {
            requestIdleCallback(processNext, { timeout: 1000 });
          } else {
            setTimeout(processNext, 16); // ~60fps
          }
        });
    };
    
    processNext();
  }

  /**
   * Preload images that are likely to be the LCP (Largest Contentful Paint)
   */
  preloadLCP(images: string[], options: PreloadOptions = { priority: true }) {
    // Preload the first few images as they're most likely to be LCP
    const lcpCandidates = images.slice(0, 3);
    
    return this.preloadBatch(
      lcpCandidates.map(src => ({
        src,
        options: { ...options, priority: true }
      }))
    );
  }

  /**
   * Clear preload cache (useful for memory management)
   */
  clearCache() {
    this.preloadedImages.clear();
    this.preloadQueue = [];
  }

  /**
   * Check if an image is already preloaded
   */
  isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src);
  }

  /**
   * Get preload statistics
   */
  getStats() {
    return {
      preloadedCount: this.preloadedImages.size,
      queueLength: this.preloadQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Export singleton instance
export const imagePreloader = new ImagePreloader();

// Utility functions
export const preloadRestaurantImages = (restaurants: any[]) => {
  const images = restaurants
    .map(r => r.cover_image_url || r.logo_url)
    .filter(Boolean)
    .slice(0, 6); // Preload first 6 images

  return imagePreloader.preloadLCP(images);
};

export const preloadImage = (src: string, priority = false) => {
  return imagePreloader.preload(src, { priority });
};
