
interface OptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  context?: 'dish' | 'restaurant' | 'gallery' | 'hero' | 'avatar';
  sizes?: string; // Add sizes to the interface
}

interface OptimizedImageData {
  webp: string;
  avif: string;
  original: string;
  sizes: string;
  quality: number;
}

interface ContextSettings {
  quality: number;
  sizes: string;
}

class ImageOptimizer {
  private static instance: ImageOptimizer;
  private optimizedCache = new Map<string, OptimizedImageData>();

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  /**
   * Get optimal settings based on context
   */
  private getContextSettings(context: string): ContextSettings {
    const settings: Record<string, ContextSettings> = {
      dish: {
        quality: 82,
        sizes: "(max-width: 768px) 320px, 480px"
      },
      restaurant: {
        quality: 85,
        sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
      },
      gallery: {
        quality: 88,
        sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      },
      hero: {
        quality: 90,
        sizes: "100vw"
      },
      avatar: {
        quality: 85,
        sizes: "(max-width: 768px) 48px, 64px"
      }
    };

    return settings[context] || { quality: 80, sizes: "100vw" };
  }

  /**
   * Generate optimized image URLs for Supabase Storage
   */
  private optimizeSupabaseUrl(url: string, options: OptimizationOptions): OptimizedImageData {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    if (this.optimizedCache.has(cacheKey)) {
      return this.optimizedCache.get(cacheKey)!;
    }

    // Check if it's a Supabase Storage URL
    if (!url.includes('supabase.co/storage')) {
      const contextSettings = this.getContextSettings(options.context || 'dish');
      const result = {
        webp: url,
        avif: url,
        original: url,
        sizes: options.sizes || contextSettings.sizes,
        quality: options.quality || contextSettings.quality
      };
      this.optimizedCache.set(cacheKey, result);
      return result;
    }

    const baseUrl = url.split('?')[0];
    const contextSettings = this.getContextSettings(options.context || 'dish');
    const quality = options.quality || contextSettings.quality;
    
    // Generate different format URLs
    const params = new URLSearchParams();
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    params.set('quality', quality.toString());
    params.set('resize', 'contain');

    // WebP version
    const webpParams = new URLSearchParams(params);
    webpParams.set('format', 'webp');
    const webpUrl = `${baseUrl}?${webpParams.toString()}`;

    // AVIF version (if supported by Supabase)
    const avifParams = new URLSearchParams(params);
    avifParams.set('format', 'avif');
    const avifUrl = `${baseUrl}?${avifParams.toString()}`;

    // Original optimized version
    const originalUrl = `${baseUrl}?${params.toString()}`;

    const result = {
      webp: webpUrl,
      avif: avifUrl,
      original: originalUrl,
      sizes: options.sizes || contextSettings.sizes,
      quality
    };

    this.optimizedCache.set(cacheKey, result);
    return result;
  }

  /**
   * Get optimized image data for a given URL and context
   */
  optimize(url: string, options: OptimizationOptions = {}): OptimizedImageData {
    if (!url) {
      return {
        webp: '',
        avif: '',
        original: '',
        sizes: '100vw',
        quality: 80
      };
    }

    return this.optimizeSupabaseUrl(url, options);
  }

  /**
   * Generate responsive srcSet for multiple breakpoints
   */
  generateResponsiveSrcSet(url: string, breakpoints: number[], context?: OptimizationOptions['context']): string {
    if (!url) return '';

    const srcSetEntries = breakpoints.map(width => {
      const optimized = this.optimize(url, { width, context });
      return `${optimized.webp} ${width}w`;
    });

    return srcSetEntries.join(', ');
  }

  /**
   * Clear optimization cache (useful for memory management)
   */
  clearCache(): void {
    this.optimizedCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.optimizedCache.size,
      keys: Array.from(this.optimizedCache.keys())
    };
  }
}

// Export singleton instance
export const imageOptimizer = ImageOptimizer.getInstance();

// Utility functions for common use cases
export const optimizeImageForContext = (url: string, context: OptimizationOptions['context'], width?: number) => {
  return imageOptimizer.optimize(url, { context, width });
};

export const generateDishImageSrcSet = (url: string) => {
  return imageOptimizer.generateResponsiveSrcSet(url, [320, 480, 640], 'dish');
};

export const generateRestaurantImageSrcSet = (url: string) => {
  return imageOptimizer.generateResponsiveSrcSet(url, [400, 600, 800, 1200], 'restaurant');
};
