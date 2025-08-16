
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  threshold?: number; // Porcentaje del viewport para trigger (0.5 = 50%)
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  lastElementRef: (node: HTMLElement | null) => void;
  isIntersecting: boolean;
  shouldLoadMore: boolean;
}

export const useInfiniteScroll = ({
  threshold = 0.5,
  rootMargin = '200px',
  enabled = true
}: UseInfiniteScrollProps = {}): UseInfiniteScrollReturn => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [shouldLoadMore, setShouldLoadMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLElement | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    const intersecting = entry.isIntersecting;
    
    setIsIntersecting(intersecting);
    
    if (intersecting && enabled) {
      setShouldLoadMore(true);
      // Reset shouldLoadMore after a brief delay to allow for new data loading
      setTimeout(() => setShouldLoadMore(false), 100);
    }
  }, [enabled]);

  const setLastElementRef = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (node && enabled) {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        threshold,
        rootMargin
      });
      observerRef.current.observe(node);
      lastElementRef.current = node;
    }
  }, [handleIntersection, threshold, rootMargin, enabled]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    lastElementRef: setLastElementRef,
    isIntersecting,
    shouldLoadMore
  };
};
