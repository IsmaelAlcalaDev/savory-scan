
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  queryTime: number | null;
  fetchCount: number;
}

export const PerformanceMetrics = ({ onMetricsChange }: { onMetricsChange?: (metrics: PerformanceMetrics) => void }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    queryTime: null,
    fetchCount: 0
  });

  useEffect(() => {
    // Solo en desarrollo para monitorear performance
    if (process.env.NODE_ENV !== 'development') return;

    // Observador de Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const updatedMetrics = { ...metrics };
        
        if (entry.entryType === 'largest-contentful-paint') {
          updatedMetrics.lcp = entry.startTime;
        }
        
        if (entry.entryType === 'first-input') {
          updatedMetrics.fid = (entry as any).processingStart - entry.startTime;
        }
        
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          updatedMetrics.cls = (updatedMetrics.cls || 0) + (entry as any).value;
        }

        setMetrics(updatedMetrics);
        onMetricsChange?.(updatedMetrics);
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Medir tiempo de queries de Supabase
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const response = await originalFetch(...args);
      const duration = performance.now() - start;
      
      if (args[0]?.toString().includes('supabase')) {
        setMetrics(prev => ({ 
          ...prev, 
          queryTime: duration,
          fetchCount: prev.fetchCount + 1
        }));
      }
      
      return response;
    };

    return () => {
      observer.disconnect();
      window.fetch = originalFetch;
    };
  }, []);

  // No renderizar nada en producción
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
      <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}</div>
      <div>FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}</div>
      <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}</div>
      <div>Query: {metrics.queryTime ? `${Math.round(metrics.queryTime)}ms` : 'N/A'}</div>
      <div>Fetches: {metrics.fetchCount}</div>
    </div>
  );
};
