
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface SystemHealthMonitorProps {
  enabled?: boolean;
  className?: string;
}

export default function SystemHealthMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  className 
}: SystemHealthMonitorProps) {
  const { metrics, healthStatus, getHealthColor, getRecommendations } = useSystemHealth();

  if (!enabled) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusIcon = () => {
    switch (healthStatus) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const recommendations = getRecommendations();
  const StatusIcon = getStatusIcon();

  return (
    <Card className={`${className} bg-background/90 border-dashed`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <Activity className="w-3 h-3" />
          System Health Monitor
          <Badge 
            variant={healthStatus === 'healthy' ? 'default' : healthStatus === 'warning' ? 'secondary' : 'destructive'}
            className="text-xs px-1 py-0"
          >
            <StatusIcon className="w-2 h-2 mr-1" />
            {healthStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Memory:</span>
              <span className={metrics.memoryUsage > 0.7 ? 'text-red-600' : 'text-green-600'}>
                {(metrics.memoryUsage * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Heap:</span>
              <span>{formatBytes(metrics.heapUsed)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Connection:</span>
              <span className="capitalize">{metrics.connectionType}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Performance:</span>
              <span className={metrics.performanceScore < 70 ? 'text-red-600' : 'text-green-600'}>
                {metrics.performanceScore.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime:</span>
              <span>{formatUptime(metrics.uptime)}</span>
            </div>
            {metrics.batteryLevel !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Battery:</span>
                <span className={metrics.isLowPowerMode ? 'text-red-600' : 'text-green-600'}>
                  {(metrics.batteryLevel * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        {recommendations.length > 0 && (
          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3" />
              <span className="font-medium">Recommendations:</span>
            </div>
            <ul className="space-y-1 text-muted-foreground">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-xs">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
