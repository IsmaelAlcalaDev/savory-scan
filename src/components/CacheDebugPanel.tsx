
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Activity, Database, Zap } from 'lucide-react';

interface CacheMetrics {
  hitRate: number;
  avgLatency: number;
  cacheStatus: string;
  geohash?: string;
  requests: number;
  hits: number;
  misses: number;
}

interface CacheDebugPanelProps {
  metrics: CacheMetrics;
  className?: string;
}

export default function CacheDebugPanel({ metrics, className }: CacheDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [historicalMetrics, setHistoricalMetrics] = useState<CacheMetrics[]>([]);

  useEffect(() => {
    // Store historical metrics for analysis
    setHistoricalMetrics(prev => {
      const updated = [...prev, { ...metrics, timestamp: Date.now() }];
      return updated.slice(-20); // Keep last 20 entries
    });
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'redis-hit': return 'bg-green-500';
      case 'edge-hit': return 'bg-blue-500';
      case 'db-fallback': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'redis-hit': return <Zap className="h-3 w-3" />;
      case 'edge-hit': return <Activity className="h-3 w-3" />;
      case 'db-fallback': return <Database className="h-3 w-3" />;
      default: return null;
    }
  };

  const avgLatency = historicalMetrics.length > 0 
    ? historicalMetrics.reduce((sum, m) => sum + m.avgLatency, 0) / historicalMetrics.length
    : metrics.avgLatency;

  const hitRate = metrics.requests > 0 ? (metrics.hits / metrics.requests) * 100 : 0;

  return (
    <Card className={`p-4 border-l-4 ${className}`} style={{ borderLeftColor: getStatusColor(metrics.cacheStatus) }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center gap-2">
              {getStatusIcon(metrics.cacheStatus)}
              <span className="font-medium">Cache Performance</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(avgLatency)}ms avg
              </Badge>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge 
                  variant={metrics.cacheStatus === 'redis-hit' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {metrics.cacheStatus}
                </Badge>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hit Rate:</span>
                <span className="font-medium">{hitRate.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Latency:</span>
                <span className="font-medium">{Math.round(avgLatency)}ms</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Requests:</span>
                <span className="font-medium">{metrics.requests || 0}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cache Hits:</span>
                <span className="font-medium text-green-600">{metrics.hits || 0}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cache Misses:</span>
                <span className="font-medium text-orange-600">{metrics.misses || 0}</span>
              </div>
            </div>
          </div>

          {metrics.geohash && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Geohash:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{metrics.geohash}</code>
            </div>
          )}

          {historicalMetrics.length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground mb-2">Recent Performance</div>
              <div className="flex gap-1 h-8">
                {historicalMetrics.slice(-10).map((metric, index) => (
                  <div
                    key={index}
                    className={`flex-1 rounded-sm ${getStatusColor(metric.cacheStatus)}`}
                    style={{ 
                      height: `${Math.min(100, (metric.avgLatency / 500) * 100)}%`,
                      opacity: 0.7 
                    }}
                    title={`${metric.cacheStatus}: ${Math.round(metric.avgLatency)}ms`}
                  />
                ))}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
