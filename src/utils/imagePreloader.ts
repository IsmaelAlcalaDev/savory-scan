import { imageOptimizer } from './imageOptimizer';

interface PreloadOptions {
  priority?: boolean;
  sizes?: string;
  type?: 'image/webp' | 'image/avif' | 'image/jpeg' | 'image/png';
  context?: 'dish' | 'restaurant' | 'gallery' | 'hero' | 'avatar';
  width?: number;
}

interface LCPCandidate {
  src: string;
  context: string;
  priority: number; // Higher = more likely to be LCP
  element?: string; // CSS selector or description
}

class ImagePreloader {
  private preloadedImages = new Set<string>();
  private preloadQueue: Array<{ src: string; options: PreloadOptions }> = [];
  private isProcessing = false;
  private lcpCandidates: LCPCandidate[] = [];

  /**
   * Preload a single image with optimization
   */
  preload(src: string, options: PreloadOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(src)) {
        resolve();
        return;
      }

      // Get optimized version
      const optimized = imageOptimizer.optimize(src, {
        width: options.width,
        context: options.context
      });

      const img = new Image();
      
      img.onload = () => {
        this.preloadedImages.add(src);
        
        // Also add to browser cache via link preload for better caching
        if (options.priority) {
          this.addPreloadLink(optimized.webp || src, options);
        }
        
        resolve();
      };
      
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`);
        reject(new Error(`Failed to preload image: ${src}`));
      };
      
      // Use WebP version if available, fallback to original
      img.src = optimized.webp || src;
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
   * Register potential LCP candidates
   */
  registerLCPCandidate(src: string, context: string, priority: number, element?: string) {
    this.lcpCandidates.push({ src, context, priority, element });
    
    // Sort by priority (highest first)
    this.lcpCandidates.sort((a, b) => b.priority - a.priority);
    
    // Only keep top 5 candidates to avoid memory bloat
    if (this.lcpCandidates.length > 5) {
      this.lcpCandidates = this.lcpCandidates.slice(0, 5);
    }
  }

  /**
   * Preload LCP candidates with context-aware optimization
   */
  preloadLCPCandidates(): Promise<void[]> {
    const topCandidates = this.lcpCandidates.slice(0, 3);
    
    const promises = topCandidates.map(candidate => 
      this.preload(candidate.src, {
        priority: true,
        context: candidate.context as PreloadOptions['context'],
        width: this.getOptimalWidthForContext(candidate.context)
      }).catch(error => {
        console.warn(`LCP preload failed for ${candidate.src}:`, error);
        return Promise.resolve();
      })
    );
    
    return Promise.all(promises);
  }

  /**
   * Get optimal width based on context and viewport
   */
  private getOptimalWidthForContext(context: string): number {
    const isMobile = window.innerWidth < 768;
    
    const contextWidths = {
      dish: isMobile ? 320 : 480,
      restaurant: isMobile ? 400 : 600,
      hero: isMobile ? 800 : 1200,
      gallery: isMobile ? 400 : 800,
      avatar: isMobile ? 48 : 64
    };
    
    return contextWidths[context as keyof typeof contextWidths] || (isMobile ? 400 : 600);
  }

  /**
   * Preload multiple images with priority queue
   */
  preloadBatch(images: Array<{ src: string; options?: PreloadOptions }>): Promise<void[]> {
    const promises = images.map(({ src, options = {} }) => 
      this.preload(src, options).catch(error => {
        console.warn(`Batch preload failed for ${src}:`, error);
        return Promise.resolve();
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
   * Clear preload cache and candidates
   */
  clearCache() {
    this.preloadedImages.clear();
    this.preloadQueue = [];
    this.lcpCandidates = [];
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
      isProcessing: this.isProcessing,
      lcpCandidatesCount: this.lcpCandidates.length,
      topLCPCandidate: this.lcpCandidates[0]?.src || null
    };
  }
}

// Export singleton instance
export const imagePreloader = new ImagePreloader();

// Utility functions for common use cases
export const preloadRestaurantImages = (restaurants: any[]) => {
  const images = restaurants
    .map((r, index) => ({
      src: r.cover_image_url || r.logo_url,
      priority: index < 4 ? 10 - index : 1, // First 4 get high priority
      context: 'restaurant'
    }))
    .filter(img => img.src)
    .slice(0, 8); // Only preload first 8 images

  // Register LCP candidates
  images.forEach(img => {
    imagePreloader.registerLCPCandidate(img.src, img.context, img.priority, 'restaurant-card');
  });

  // Preload LCP candidates immediately
  imagePreloader.preloadLCPCandidates();

  // Queue the rest for background loading
  images.slice(3).forEach(img => {
    imagePreloader.queuePreload(img.src, { context: 'restaurant' as PreloadOptions['context'] });
  });
};

export const preloadDishImages = (dishes: any[]) => {
  const images = dishes
    .map((d, index) => ({
      src: d.image_url,
      priority: index < 6 ? 10 - index : 1, // First 6 get high priority
      context: 'dish'
    }))
    .filter(img => img.src)
    .slice(0, 12); // Only preload first 12 images

  // Register LCP candidates for dishes
  images.forEach(img => {
    imagePreloader.registerLCPCandidate(img.src, img.context, img.priority, 'dish-card');
  });

  // Preload LCP candidates immediately
  imagePreloader.preloadLCPCandidates();

  // Queue the rest for background loading
  images.slice(3).forEach(img => {
    imagePreloader.queuePreload(img.src, { context: 'dish' as PreloadOptions['context'] });
  });
};

export const preloadImage = (src: string, priority = false, context: PreloadOptions['context'] = 'dish') => {
  if (priority) {
    imagePreloader.registerLCPCandidate(src, context, 10, 'manual-preload');
    return imagePreloader.preload(src, { priority, context });
  }
  
  imagePreloader.queuePreload(src, { context });
  return Promise.resolve();
};
