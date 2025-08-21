import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtimeMetrics } from '@/hooks/useAnalyticsData';
import { Activity, Clock, Zap } from 'lucide-react';

export default function RealtimeMetrics() {
  const { data: realtimeData, isLoading } = useRealtimeMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actividad en Tiempo Real
          </CardTitle>
          <CardDescription>Últimos 5 minutos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-pulse text-muted-foreground">Cargando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityStatus = (count: number) => {
    if (count > 10) return { color: 'bg-green-500', text: 'Alta actividad' };
    if (count > 5) return { color: 'bg-yellow-500', text: 'Actividad moderada' };
    if (count > 0) return { color: 'bg-blue-500', text: 'Actividad baja' };
    return { color: 'bg-gray-500', text: 'Sin actividad' };
  };

  const status = getActivityStatus(realtimeData?.last5Minutes || 0);

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Actividad en Tiempo Real
          <div className={`w-2 h-2 ${status.color} rounded-full animate-pulse`}></div>
        </CardTitle>
        <CardDescription>Últimos 5 minutos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">
                {realtimeData?.last5Minutes || 0}
              </span>
              <span className="text-sm text-muted-foreground">eventos</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {status.text}
            </Badge>
          </div>
        </div>
        
        {realtimeData?.events && realtimeData.events.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-foreground">Eventos recientes:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {realtimeData.events.slice(0, 5).map((event, index) => (
                <div key={index} className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                  <span className="font-medium">{event.event_type}</span>
                  {event.event_name && <span className="ml-2">• {event.event_name}</span>}
                  <span className="ml-2 opacity-75">
                    {new Date(event.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}