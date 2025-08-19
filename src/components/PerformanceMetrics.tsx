
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface PerformanceMetricsProps {
  serverTiming?: number | null;
  className?: string;
}

export default function PerformanceMetrics({ serverTiming, className }: PerformanceMetricsProps) {
  if (!serverTiming) return null;

  const getPerformanceColor = (ms: number) => {
    if (ms < 100) return 'text-green-600';
    if (ms < 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (ms: number) => {
    if (ms < 100) return 'Excelente';
    if (ms < 300) return 'Bueno';
    return 'Lento';
  };

  return (
    <Card className={`${className} border-dashed border-gray-300`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Rendimiento del Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tiempo de respuesta:</span>
          <div className="flex items-center gap-2">
            <span className={`font-mono text-sm ${getPerformanceColor(serverTiming)}`}>
              {serverTiming.toFixed(1)}ms
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${getPerformanceColor(serverTiming)} bg-opacity-10`}>
              {getPerformanceLabel(serverTiming)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
