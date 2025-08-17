
import React, { useState, useEffect } from 'react';
import { enhancedRealtimeManager } from '@/services/enhancedRealtimeManager';
import { Card } from '@/components/ui/card';

interface RealtimeMetricsProps {
  className?: string;
  showDetailed?: boolean;
}

export const RealtimeMetrics: React.FC<RealtimeMetricsProps> = ({ 
  className = '', 
  showDetailed = false 
}) => {
  const [metrics, setMetrics] = useState({
    channels: {} as Record<string, string>,
    metrics: {
      channelCount: 0,
      reconnectionCount: 0,
      filterUpdateCount: 0,
      oldestChannelAge: 0
    }
  });

  useEffect(() => {
    const updateMetrics = () => {
      const status = enhancedRealtimeManager.getStatus();
      setMetrics(status);
    };

    // Initial update
    updateMetrics();

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatAge = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (!showDetailed) {
    return (
      <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
        <span className="inline-flex items-center gap-1">
          🔗 {metrics.metrics.channelCount}
        </span>
        <span className="inline-flex items-center gap-1">
          🔄 {metrics.metrics.reconnectionCount}
        </span>
        <span className="inline-flex items-center gap-1">
          📊 {metrics.metrics.filterUpdateCount}
        </span>
      </div>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-sm font-medium mb-3">Realtime Metrics</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Active Channels</div>
          <div className="text-lg font-mono">{metrics.metrics.channelCount}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Reconnections</div>
          <div className="text-lg font-mono text-orange-600">{metrics.metrics.reconnectionCount}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Filter Updates</div>
          <div className="text-lg font-mono text-blue-600">{metrics.metrics.filterUpdateCount}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Oldest Channel</div>
          <div className="text-lg font-mono text-green-600">
            {formatAge(metrics.metrics.oldestChannelAge)}
          </div>
        </div>
      </div>

      {Object.keys(metrics.channels).length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Channel Status</div>
          {Object.entries(metrics.channels).map(([name, status]) => (
            <div key={name} className="flex justify-between items-center text-xs">
              <span className="font-mono">{name}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                status === 'joined' ? 'bg-green-100 text-green-800' :
                status === 'joining' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
