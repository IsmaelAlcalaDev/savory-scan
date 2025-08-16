
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  quality?: 'low' | 'medium' | 'high';
  sizes?: string;
}

export default function LazyImage({
  src,
  alt,
  className,
  width,
  height,
  placeholder,
  onLoad,
  onError,
  priority = false,
  quality = 'medium',
  sizes
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate optimized image URL based on quality
  const getOptimizedSrc = (originalSrc: string, quality: string) => {
    if (!originalSrc) return '';
    
    // If it's a Supabase storage URL, we can add transform parameters
    if (originalSrc.includes('supabase')) {
      const url = new URL(originalSrc);
      switch (quality) {
        case 'low':
          url.searchParams.set('quality', '60');
          url.searchParams.set('format', 'webp');
          break;
        case 'medium':
          url.searchParams.set('quality', '80');
          url.searchParams.set('format', 'webp');
          break;
        case 'high':
          url.searchParams.set('quality', '95');
          break;
      }
      if (width) url.searchParams.set('width', width.toString());
      if (height) url.searchParams.set('height', height.toString());
      return url.toString();
    }
    
    return originalSrc;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Set image source when in view
  useEffect(() => {
    if (isInView && src && !imageSrc) {
      const optimizedSrc = getOptimizedSrc(src, quality);
      setImageSrc(optimizedSrc);
    }
  }, [isInView, src, quality, imageSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate placeholder with blur effect
  const placeholderSrc = placeholder || `data:image/svg+xml;base64,${btoa(`
    <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(var(--muted));stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(var(--muted-foreground));stop-opacity:0.1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `)}`;

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      {/* Placeholder */}
      <div 
        className={cn(
          "absolute inset-0 bg-muted transition-opacity duration-300",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
        style={{
          backgroundImage: `url(${placeholderSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)'
        }}
      />
      
      {/* Actual image */}
      {isInView && !hasError && imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          sizes={sizes}
        />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-muted-foreground text-sm text-center p-4">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <p>Imagen no disponible</p>
          </div>
        </div>
      )}
      
      {/* Loading animation */}
      {isInView && !isLoaded && !hasError && imageSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
