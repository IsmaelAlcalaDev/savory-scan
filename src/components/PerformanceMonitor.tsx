
import { useEffect, useState } from 'react';
import { serviceWorkerManager, getPerformanceMetrics } from '@/utils/serviceWorker';

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  domContentLoaded: number;
  loadComplete: number;
  dns: number;
  tcp: number;
  request: number;
  response: number;
  totalLoadTime: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  onMetrics?: (metrics: PerformanceMetrics | null) => void;
}

export default function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  onMetrics
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(serviceWorkerManager.isOnline);

  useEffect(() => {
    if (!enabled) return;

    console.log('🚀 Performance Monitor initialized');

    // Collect initial metrics
    const initialMetrics = getPerformanceMetrics();
    setMetrics(initialMetrics);
    onMetrics?.(initialMetrics);

    // Monitor LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      if (initialMetrics) {
        const updatedMetrics = { ...initialMetrics, lcp: lastEntry.startTime };
        setMetrics(updatedMetrics);
        onMetrics?.(updatedMetrics);
        console.log('📊 LCP:', lastEntry.startTime.toFixed(2) + 'ms');
      }
    });

    // Monitor FID
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (initialMetrics) {
          const updatedMetrics = { ...initialMetrics, fid: entry.processingStart - entry.startTime };
          setMetrics(updatedMetrics);
          onMetrics?.(updatedMetrics);
          console.log('⚡ FID:', (entry.processingStart - entry.startTime).toFixed(2) + 'ms');
        }
      });
    });

    // Monitor CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          if (initialMetrics) {
            const updatedMetrics = { ...initialMetrics, cls: clsValue };
            setMetrics(updatedMetrics);
            onMetrics?.(updatedMetrics);
            console.log('📐 CLS:', clsValue.toFixed(3));
          }
        }
      });
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Monitor cache size
    const updateCacheSize = async () => {
      const size = await serviceWorkerManager.getCacheSize();
      setCacheSize(size);
    };

    updateCacheSize();
    const cacheInterval = setInterval(updateCacheSize, 30000); // Check every 30s

    // Monitor network status
    const removeNetworkListeners = serviceWorkerManager.addNetworkListeners(
      () => {
        setIsOnline(true);
        console.log('🌐 Network: Online');
      },
      () => {
        setIsOnline(false);
        console.log('📡 Network: Offline');
      }
    );

    // Log performance summary
    setTimeout(() => {
      if (initialMetrics) {
        console.log('📈 Performance Summary:', {
          'Total Load Time': initialMetrics.totalLoadTime.toFixed(2) + 'ms',
          'DOM Content Loaded': initialMetrics.domContentLoaded.toFixed(2) + 'ms',
          'First Contentful Paint': initialMetrics.fcp.toFixed(2) + 'ms',
          'DNS Lookup': initialMetrics.dns.toFixed(2) + 'ms',
          'TCP Connection': initialMetrics.tcp.toFixed(2) + 'ms',
          'Request Time': initialMetrics.request.toFixed(2) + 'ms',
          'Response Time': initialMetrics.response.toFixed(2) + 'ms'
        });
      }
    }, 1000);

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      clearInterval(cacheInterval);
      removeNetworkListeners();
    };
  }, [enabled, onMetrics]);

  // Don't render anything in production
  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-background/90 border rounded-lg p-3 text-xs font-mono z-50 max-w-sm">
      <div className="font-semibold mb-2 flex items-center gap-2">
        <span>⚡ Performance</span>
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      
      {metrics && (
        <div className="space-y-1">
          {metrics.lcp > 0 && (
            <div className="flex justify-between">
              <span>LCP:</span>
              <span className={metrics.lcp < 2500 ? 'text-green-600' : metrics.lcp < 4000 ? 'text-yellow-600' : 'text-red-600'}>
                {metrics.lcp.toFixed(0)}ms
              </span>
            </div>
          )}
          
          {metrics.fcp > 0 && (
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={metrics.fcp < 1800 ? 'text-green-600' : metrics.fcp < 3000 ? 'text-yellow-600' : 'text-red-600'}>
                {metrics.fcp.toFixed(0)}ms
              </span>
            </div>
          )}
          
          {metrics.fid > 0 && (
            <div className="flex justify-between">
              <span>FID:</span>
              <span className={metrics.fid < 100 ? 'text-green-600' : metrics.fid < 300 ? 'text-yellow-600' : 'text-red-600'}>
                {metrics.fid.toFixed(0)}ms
              </span>
            </div>
          )}
          
          {metrics.cls > 0 && (
            <div className="flex justify-between">
              <span>CLS:</span>
              <span className={metrics.cls < 0.1 ? 'text-green-600' : metrics.cls < 0.25 ? 'text-yellow-600' : 'text-red-600'}>
                {metrics.cls.toFixed(3)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Load:</span>
            <span>{metrics.totalLoadTime.toFixed(0)}ms</span>
          </div>
          
          {cacheSize > 0 && (
            <div className="flex justify-between">
              <span>Cache:</span>
              <span>{(cacheSize / 1024 / 1024).toFixed(1)}MB</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
