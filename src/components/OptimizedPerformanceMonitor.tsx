
import { useOptimizedPerformance } from '@/hooks/useOptimizedPerformance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Layout, Eye } from 'lucide-react';

interface OptimizedPerformanceMonitorProps {
  enabled?: boolean;
  className?: string;
}

export default function OptimizedPerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  className 
}: OptimizedPerformanceMonitorProps) {
  const metrics = useOptimizedPerformance({ 
    enabled,
    trackErrors: true 
  });

  if (!enabled || Object.keys(metrics).length === 0) return null;

  const getScoreColor = (metric: string, value: number) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 200, poor: 600 }
    } as const;

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'secondary';

    if (value <= threshold.good) return 'default'; // Green
    if (value <= threshold.poor) return 'secondary'; // Yellow
    return 'destructive'; // Red
  };

  const formatValue = (metric: string, value: number) => {
    if (metric === 'cls') return value.toFixed(3);
    return Math.round(value) + 'ms';
  };

  const getMetricIcon = (metric: string) => {
    const icons = {
      lcp: Eye,
      fid: Zap,
      cls: Layout,
      fcp: Activity,
      ttfb: Activity
    } as const;
    
    const IconComponent = icons[metric as keyof typeof icons] || Activity;
    return <IconComponent className="w-3 h-3" />;
  };

  return (
    <Card className={`${className} bg-background/90 border-dashed`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <Activity className="w-3 h-3" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {Object.entries(metrics).map(([metric, value]) => (
          <div key={metric} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {getMetricIcon(metric)}
              <span className="font-mono uppercase">{metric}:</span>
            </div>
            <Badge 
              variant={getScoreColor(metric, value)} 
              className="text-xs px-1 py-0"
            >
              {formatValue(metric, value)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
