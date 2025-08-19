
import { useState, useEffect, useCallback } from 'react';

interface SystemHealthMetrics {
  memoryUsage: number;
  heapUsed: number;
  heapTotal: number;
  connectionType: string;
  batteryLevel?: number;
  isLowPowerMode?: boolean;
  performanceScore: number;
  errorRate: number;
  uptime: number;
}

interface HealthThresholds {
  memoryWarning: number;
  memoryCritical: number;
  performanceWarning: number;
  performanceCritical: number;
  errorRateWarning: number;
  errorRateCritical: number;
}

export const useSystemHealth = () => {
  const [metrics, setMetrics] = useState<SystemHealthMetrics>({
    memoryUsage: 0,
    heapUsed: 0,
    heapTotal: 0,
    connectionType: 'unknown',
    performanceScore: 100,
    errorRate: 0,
    uptime: 0
  });

  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [startTime] = useState(Date.now());

  const thresholds: HealthThresholds = {
    memoryWarning: 0.7, // 70% memory usage
    memoryCritical: 0.9, // 90% memory usage
    performanceWarning: 70, // Performance score below 70
    performanceCritical: 50, // Performance score below 50
    errorRateWarning: 0.05, // 5% error rate
    errorRateCritical: 0.1 // 10% error rate
  };

  const collectMetrics = useCallback(async () => {
    const newMetrics: Partial<SystemHealthMetrics> = {};

    try {
      // Memory information
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        newMetrics.heapUsed = memory.usedJSHeapSize;
        newMetrics.heapTotal = memory.totalJSHeapSize;
        newMetrics.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      }

      // Connection information
      if ((navigator as any).connection) {
        newMetrics.connectionType = (navigator as any).connection.effectiveType || 'unknown';
      }

      // Battery information (if available)
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          newMetrics.batteryLevel = battery.level;
          newMetrics.isLowPowerMode = battery.level < 0.2; // Consider low power if < 20%
        } catch (error) {
          console.warn('Battery API not available:', error);
        }
      }

      // Performance score based on various factors
      let performanceScore = 100;
      
      // Reduce score based on memory usage
      if (newMetrics.memoryUsage && newMetrics.memoryUsage > 0.5) {
        performanceScore -= (newMetrics.memoryUsage - 0.5) * 100;
      }

      // Reduce score based on connection quality
      if (newMetrics.connectionType === 'slow-2g' || newMetrics.connectionType === '2g') {
        performanceScore -= 30;
      } else if (newMetrics.connectionType === '3g') {
        performanceScore -= 15;
      }

      // Reduce score if low battery
      if (newMetrics.isLowPowerMode) {
        performanceScore -= 20;
      }

      newMetrics.performanceScore = Math.max(0, performanceScore);
      newMetrics.uptime = Date.now() - startTime;

      setMetrics(prev => ({ ...prev, ...newMetrics }));

      // Determine health status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';

      if (newMetrics.memoryUsage && newMetrics.memoryUsage > thresholds.memoryCritical) {
        status = 'critical';
      } else if (newMetrics.performanceScore && newMetrics.performanceScore < thresholds.performanceCritical) {
        status = 'critical';
      } else if (newMetrics.memoryUsage && newMetrics.memoryUsage > thresholds.memoryWarning) {
        status = 'warning';
      } else if (newMetrics.performanceScore && newMetrics.performanceScore < thresholds.performanceWarning) {
        status = 'warning';
      }

      setHealthStatus(status);

      // Log to analytics if health is not good
      if (status !== 'healthy') {
        logHealthMetrics(newMetrics as SystemHealthMetrics, status);
      }

    } catch (error) {
      console.warn('Error collecting system health metrics:', error);
    }
  }, [startTime, thresholds]);

  const logHealthMetrics = useCallback(async (metrics: SystemHealthMetrics, status: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      await supabase.from('analytics_events').insert({
        event_type: 'system_health',
        event_name: 'health_check',
        properties: {
          ...metrics,
          healthStatus: status,
          timestamp: Date.now(),
          url: window.location.pathname
        }
      });
    } catch (error) {
      console.warn('Failed to log health metrics:', error);
    }
  }, []);

  const optimizePerformance = useCallback(() => {
    // Trigger garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }

    // Clear any cached data if memory is critical
    if (metrics.memoryUsage > thresholds.memoryCritical) {
      // Clear images from cache
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src.startsWith('blob:')) {
          URL.revokeObjectURL(img.src);
        }
      });

      console.log('🧹 Performance optimization triggered due to high memory usage');
    }
  }, [metrics.memoryUsage, thresholds.memoryCritical]);

  // Collect metrics periodically
  useEffect(() => {
    collectMetrics();
    
    const interval = setInterval(collectMetrics, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [collectMetrics]);

  // Auto-optimize when performance is critical
  useEffect(() => {
    if (healthStatus === 'critical') {
      optimizePerformance();
    }
  }, [healthStatus, optimizePerformance]);

  const getHealthColor = () => {
    switch (healthStatus) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRecommendations = (): string[] => {
    const recommendations: string[] = [];

    if (metrics.memoryUsage > thresholds.memoryWarning) {
      recommendations.push('High memory usage detected. Consider closing unused tabs.');
    }

    if (metrics.connectionType === 'slow-2g' || metrics.connectionType === '2g') {
      recommendations.push('Slow connection detected. Some features may be limited.');
    }

    if (metrics.isLowPowerMode) {
      recommendations.push('Low battery detected. App will reduce animations and background tasks.');
    }

    if (metrics.performanceScore < thresholds.performanceWarning) {
      recommendations.push('Performance issues detected. Try refreshing the page.');
    }

    return recommendations;
  };

  return {
    metrics,
    healthStatus,
    getHealthColor,
    getRecommendations,
    optimizePerformance,
    collectMetrics
  };
};
