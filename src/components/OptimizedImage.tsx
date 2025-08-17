
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized sources for Supabase Storage
  const generateOptimizedSrc = (originalSrc: string, format: 'webp' | 'avif' | 'original' = 'original') => {
    if (!originalSrc || originalSrc.includes('data:')) return originalSrc;
    
    // If it's a Supabase Storage URL, we can add transformation parameters
    if (originalSrc.includes('supabase.co/storage')) {
      const url = new URL(originalSrc);
      const params = new URLSearchParams();
      
      if (width) params.set('width', width.toString());
      if (height) params.set('height', height.toString());
      params.set('quality', quality.toString());
      params.set('resize', 'contain');
      
      // Add format parameter for WebP/AVIF if supported
      if (format === 'webp') params.set('format', 'webp');
      if (format === 'avif') params.set('format', 'avif');
      
      url.search = params.toString();
      return url.toString();
    }
    
    return originalSrc;
  };

  const webpSrc = generateOptimizedSrc(src, 'webp');
  const avifSrc = generateOptimizedSrc(src, 'avif');
  const originalSrc = generateOptimizedSrc(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Preload critical images for LCP
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = webpSrc; // Preload WebP as it has good support
      
      if (sizes) {
        link.imageSizes = sizes;
      }
      
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [priority, webpSrc, sizes]);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Generate blur placeholder
  const generateBlurPlaceholder = () => {
    if (blurDataURL) return blurDataURL;
    
    // Simple 1x1 pixel blur placeholder with better compression
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjNmNGY2Ii8+Cjwvc3ZnPgo=';
  };

  if (!isInView && !priority) {
    return (
      <div
        ref={imgRef}
        className={cn('bg-muted animate-pulse', className)}
        style={{ 
          width: width || '100%', 
          height: height || '100%',
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} ref={imgRef}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && !isError && (
        <img
          src={generateBlurPlaceholder()}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          aria-hidden="true"
        />
      )}

      {/* Main image with progressive enhancement */}
      <picture>
        {/* AVIF - best compression */}
        <source srcSet={avifSrc} type="image/avif" sizes={sizes} />
        
        {/* WebP - good compression, wide support */}
        <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
        
        {/* Fallback to original format */}
        <img
          src={originalSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            isError && 'hidden'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
        />
      </picture>

      {/* Error fallback */}
      {isError && (
        <div className={cn('flex items-center justify-center bg-muted text-muted-foreground min-h-[120px]', className)}>
          <span className="text-sm">Error al cargar imagen</span>
        </div>
      )}
    </div>
  );
}
