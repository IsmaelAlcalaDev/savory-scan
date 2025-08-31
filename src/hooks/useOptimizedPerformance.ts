
import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  domContentLoaded: number;
  loadComplete: number;
}

interface UseOptimizedPerformanceOptions {
  enabled?: boolean;
  onMetrics?: (metrics: Partial<PerformanceMetrics>) => void;
  trackErrors?: boolean;
}

export const useOptimizedPerformance = (options: UseOptimizedPerformanceOptions = {}) => {
  const { enabled = true, onMetrics, trackErrors = true } = options;
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});
  const observersRef = useRef<PerformanceObserver[]>([]);

  const reportMetric = useCallback((name: keyof PerformanceMetrics, value: number) => {
    metricsRef.current[name] = value;
    onMetrics?.(metricsRef.current);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name.toUpperCase()}: ${value.toFixed(2)}ms`);
    }
  }, [onMetrics]);

  const logPerformanceToAnalytics = useCallback(async (metrics: Partial<PerformanceMetrics>) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      await supabase.from('analytics_events').insert({
        event_type: 'performance',
        event_name: 'core_web_vitals',
        properties: {
          ...metrics,
          timestamp: Date.now(),
          url: window.location.pathname,
          user_agent: navigator.userAgent.substring(0, 200)
        }
      });
    } catch (error) {
      console.warn('Failed to log performance metrics:', error);
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Clear previous observers
    observersRef.current.forEach(observer => observer.disconnect());
    observersRef.current = [];

    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          reportMetric('lcp', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observersRef.current.push(lcpObserver);

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          reportMetric('fid', fid);
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      observersRef.current.push(fidObserver);

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            reportMetric('cls', clsValue);
          }
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observersRef.current.push(clsObserver);

      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            reportMetric('fcp', entry.startTime);
          }
        });
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      observersRef.current.push(fcpObserver);

      // Navigation timing
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        
        // Time to First Byte (TTFB)
        reportMetric('ttfb', nav.responseStart - nav.requestStart);
        
        // DOM Content Loaded
        reportMetric('domContentLoaded', nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart);
        
        // Load Complete
        reportMetric('loadComplete', nav.loadEventEnd - nav.loadEventStart);
      }

      // Error tracking
      if (trackErrors) {
        const errorHandler = (event: ErrorEvent) => {
          console.error('🚨 Runtime Error:', event.error);
          logPerformanceToAnalytics({
            ...metricsRef.current,
            // Add error context
          }).catch(console.warn);
        };

        const rejectionHandler = (event: PromiseRejectionEvent) => {
          console.error('🚨 Unhandled Promise Rejection:', event.reason);
        };

        window.addEventListener('error', errorHandler);
        window.addEventListener('unhandledrejection', rejectionHandler);

        return () => {
          window.removeEventListener('error', errorHandler);
          window.removeEventListener('unhandledrejection', rejectionHandler);
        };
      }

    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Log final metrics after page load
    const finalMetricsTimer = setTimeout(() => {
      if (Object.keys(metricsRef.current).length > 0) {
        logPerformanceToAnalytics(metricsRef.current).catch(console.warn);
      }
    }, 5000);

    return () => {
      observersRef.current.forEach(observer => observer.disconnect());
      clearTimeout(finalMetricsTimer);
    };
  }, [enabled, reportMetric, logPerformanceToAnalytics, trackErrors]);

  return metricsRef.current;
};
