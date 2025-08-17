
import { useEffect, useCallback, useRef } from 'react';
import { errorHandler } from '@/services/errorHandlingService';

interface RUMMetrics {
  pageLoad: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

interface UserJourney {
  sessionId: string;
  startTime: number;
  interactions: Array<{
    type: string;
    timestamp: number;
    element?: string;
    duration?: number;
  }>;
  errors: Array<{
    error: string;
    timestamp: number;
    context?: any;
  }>;
  performance: Partial<RUMMetrics>;
}

export const useRealUserMonitoring = (enabled: boolean = true) => {
  const sessionRef = useRef<UserJourney | null>(null);
  const observersRef = useRef<PerformanceObserver[]>([]);
  const metricsRef = useRef<Partial<RUMMetrics>>({});

  const initializeSession = useCallback(() => {
    if (!enabled) return;

    sessionRef.current = {
      sessionId: `rum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      interactions: [],
      errors: [],
      performance: {}
    };

    console.log('🔍 RUM Session initialized:', sessionRef.current.sessionId);
  }, [enabled]);

  const trackInteraction = useCallback((type: string, element?: string, duration?: number) => {
    if (!sessionRef.current) return;

    sessionRef.current.interactions.push({
      type,
      timestamp: Date.now(),
      element,
      duration
    });

    // Limit interaction history to prevent memory bloat
    if (sessionRef.current.interactions.length > 100) {
      sessionRef.current.interactions = sessionRef.current.interactions.slice(-50);
    }
  }, []);

  const trackError = useCallback((error: string, context?: any) => {
    if (!sessionRef.current) return;

    sessionRef.current.errors.push({
      error,
      timestamp: Date.now(),
      context
    });

    // Also log to error handling service
    errorHandler.logError(new Error(error), {
      component: 'RUM',
      sessionId: sessionRef.current.sessionId,
      metadata: context
    });
  }, []);

  const sendRUMData = useCallback(async () => {
    if (!sessionRef.current || !enabled) return;

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      const rumData = {
        event_type: 'rum',
        event_name: 'session_data',
        properties: {
          session_id: sessionRef.current.sessionId,
          session_duration: Date.now() - sessionRef.current.startTime,
          interactions_count: sessionRef.current.interactions.length,
          errors_count: sessionRef.current.errors.length,
          performance_metrics: metricsRef.current,
          interactions: sessionRef.current.interactions.slice(-20), // Last 20 interactions
          errors: sessionRef.current.errors,
          page_url: window.location.href,
          referrer: document.referrer,
          timestamp: Date.now()
        }
      };

      await supabase.from('analytics_events').insert(rumData);
      console.log('📊 RUM data sent successfully');
    } catch (error) {
      console.warn('Failed to send RUM data:', error);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    initializeSession();

    // Set up performance observers
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          metricsRef.current.largestContentfulPaint = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observersRef.current.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metricsRef.current.firstInputDelay = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      observersRef.current.push(fidObserver);

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            metricsRef.current.cumulativeLayoutShift = clsValue;
          }
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observersRef.current.push(clsObserver);

      // Navigation timing
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        metricsRef.current.pageLoad = nav.loadEventEnd - nav.loadEventStart;
        metricsRef.current.timeToInteractive = nav.domInteractive - nav.navigationStart;
      }

    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Track user interactions
    const trackClick = (event: Event) => {
      const target = event.target as HTMLElement;
      trackInteraction('click', target.tagName + (target.className ? `.${target.className.split(' ')[0]}` : ''));
    };

    const trackScroll = () => {
      trackInteraction('scroll');
    };

    const trackKeydown = () => {
      trackInteraction('keydown');
    };

    // Throttled scroll tracking
    let scrollTimeout: NodeJS.Timeout;
    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScroll, 250);
    };

    document.addEventListener('click', trackClick);
    document.addEventListener('scroll', throttledScroll, { passive: true });
    document.addEventListener('keydown', trackKeydown);

    // Send data periodically and on page unload
    const sendInterval = setInterval(sendRUMData, 30000); // Every 30 seconds

    const handleBeforeUnload = () => {
      sendRUMData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Cleanup
      observersRef.current.forEach(observer => observer.disconnect());
      document.removeEventListener('click', trackClick);
      document.removeEventListener('scroll', throttledScroll);
      document.removeEventListener('keydown', trackKeydown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(sendInterval);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [enabled, initializeSession, trackInteraction, sendRUMData]);

  return {
    trackInteraction,
    trackError,
    sessionId: sessionRef.current?.sessionId,
    metrics: metricsRef.current
  };
};
