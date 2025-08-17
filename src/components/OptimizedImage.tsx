
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { imageOptimizer } from '@/utils/imageOptimizer';

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
  context?: 'dish' | 'restaurant' | 'gallery' | 'hero' | 'avatar';
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
  quality,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  context = 'dish',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image data using our optimizer
  const optimizedData = imageOptimizer.optimize(src, {
    width,
    height,
    quality,
    context
  });

  // Use provided sizes or context-based sizes from optimizer
  const responsiveSizes = sizes || optimizedData.sizes;

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
    if (priority && optimizedData.webp) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedData.webp;
      
      if (responsiveSizes) {
        link.imageSizes = responsiveSizes;
      }
      
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [priority, optimizedData.webp, responsiveSizes]);

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
    
    // Simple 1x1 pixel blur placeholder optimized for the context
    const contextColors = {
      dish: '#f8fafc',
      restaurant: '#f1f5f9',
      gallery: '#f8fafc',
      hero: '#e2e8f0',
      avatar: '#f1f5f9'
    };
    
    const bgColor = contextColors[context] || '#f3f4f6';
    return `data:image/svg+xml;base64,${btoa(`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="${bgColor}"/></svg>`)}`;
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
        {/* AVIF - best compression (only if we have a different AVIF URL) */}
        {optimizedData.avif !== optimizedData.original && (
          <source srcSet={optimizedData.avif} type="image/avif" sizes={responsiveSizes} />
        )}
        
        {/* WebP - good compression, wide support */}
        {optimizedData.webp !== optimizedData.original && (
          <source srcSet={optimizedData.webp} type="image/webp" sizes={responsiveSizes} />
        )}
        
        {/* Fallback to original format */}
        <img
          src={optimizedData.original}
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
          sizes={responsiveSizes}
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
