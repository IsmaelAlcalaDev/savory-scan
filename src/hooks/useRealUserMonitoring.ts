
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface RUMMetrics {
  sessionId: string;
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  timeToInteractive: number;
}

interface UseRealUserMonitoringOptions {
  enabled?: boolean;
  sampleRate?: number;
  maxSessionDuration?: number;
}

export const useRealUserMonitoring = (options: UseRealUserMonitoringOptions = {}) => {
  const { 
    enabled = true, 
    sampleRate = 0.1, // 10% sampling
    maxSessionDuration = 30 * 60 * 1000 // 30 minutes
  } = options;
  
  const location = useLocation();

  const generateSessionId = useCallback(() => {
    return `rum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const shouldSample = useCallback(() => {
    return Math.random() < sampleRate;
  }, [sampleRate]);

  const collectRUMMetrics = useCallback(async (): Promise<Partial<RUMMetrics>> => {
    const metrics: Partial<RUMMetrics> = {
      sessionId: generateSessionId()
    };

    try {
      // Navigation timing
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        
        metrics.pageLoadTime = nav.loadEventEnd - nav.fetchStart;
        metrics.domContentLoaded = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
        metrics.timeToInteractive = nav.domInteractive - nav.fetchStart;
      }

      // Paint timing
      const paintEntries = performance.getEntriesByName('first-contentful-paint');
      if (paintEntries.length > 0) {
        metrics.firstContentfulPaint = paintEntries[0].startTime;
      }

      // LCP via PerformanceObserver
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            metrics.largestContentfulPaint = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // FID
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            metrics.firstInputDelay = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          metrics.cumulativeLayoutShift = clsValue;
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      }

      // Total Blocking Time calculation
      const longTaskEntries = performance.getEntriesByType('longtask');
      let totalBlockingTime = 0;
      longTaskEntries.forEach((entry) => {
        if (entry.duration > 50) {
          totalBlockingTime += entry.duration - 50;
        }
      });
      metrics.totalBlockingTime = totalBlockingTime;

    } catch (error) {
      console.warn('Error collecting RUM metrics:', error);
    }

    return metrics;
  }, [generateSessionId]);

  const sendRUMData = useCallback(async (metrics: Partial<RUMMetrics>) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      await supabase.from('analytics_events').insert({
        event_type: 'rum',
        event_name: 'page_metrics',
        properties: {
          ...metrics,
          url: window.location.pathname,
          userAgent: navigator.userAgent.substring(0, 200),
          timestamp: Date.now(),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          connection: (navigator as any).connection ? {
            effectiveType: (navigator as any).connection.effectiveType,
            downlink: (navigator as any).connection.downlink
          } : null
        }
      });

      console.log('📊 RUM data sent successfully');
    } catch (error) {
      console.warn('Failed to send RUM data:', error);
    }
  }, []);

  const trackPageView = useCallback(async () => {
    if (!enabled || !shouldSample()) return;

    console.log('📊 Starting RUM tracking for:', location.pathname);

    // Collect metrics after page is fully loaded
    if (document.readyState === 'complete') {
      setTimeout(async () => {
        const metrics = await collectRUMMetrics();
        await sendRUMData(metrics);
      }, 2000);
    } else {
      window.addEventListener('load', async () => {
        setTimeout(async () => {
          const metrics = await collectRUMMetrics();
          await sendRUMData(metrics);
        }, 2000);
      });
    }
  }, [enabled, shouldSample, location.pathname, collectRUMMetrics, sendRUMData]);

  // Track page views
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  // Track session duration and user engagement
  useEffect(() => {
    if (!enabled) return;

    const sessionStart = Date.now();
    let isActive = true;
    let totalActiveTime = 0;
    let lastActiveTime = sessionStart;

    const updateActiveTime = () => {
      if (isActive) {
        totalActiveTime += Date.now() - lastActiveTime;
      }
      lastActiveTime = Date.now();
    };

    const handleVisibilityChange = () => {
      updateActiveTime();
      isActive = !document.hidden;
      if (isActive) {
        lastActiveTime = Date.now();
      }
    };

    const handleBeforeUnload = async () => {
      updateActiveTime();
      
      // Send session summary
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        await supabase.from('analytics_events').insert({
          event_type: 'rum',
          event_name: 'session_end',
          properties: {
            sessionDuration: Date.now() - sessionStart,
            activeTime: totalActiveTime,
            url: window.location.pathname,
            timestamp: Date.now()
          }
        });
      } catch (error) {
        console.warn('Failed to send session data:', error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup session if it exceeds max duration
    const sessionTimeout = setTimeout(() => {
      handleBeforeUnload();
    }, maxSessionDuration);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(sessionTimeout);
    };
  }, [enabled, maxSessionDuration]);

  return {
    collectRUMMetrics,
    sendRUMData,
    trackPageView
  };
};
