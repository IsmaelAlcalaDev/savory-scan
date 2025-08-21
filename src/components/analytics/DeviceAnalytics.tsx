import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, Monitor, Tablet } from 'lucide-react';

const chartConfig = {
  interactions: {
    label: "Interacciones",
    color: "hsl(var(--chart-1))",
  },
};

export default function DeviceAnalytics() {
  const { data: deviceData, isLoading } = useQuery({
    queryKey: ['device-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_interactions')
        .select('metadata, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Analyze device usage patterns
      const hourlyDeviceData = new Map();
      
      data?.forEach(interaction => {
        const hour = new Date(interaction.created_at).getHours();
        const metadata = interaction.metadata as any;
        const deviceType = metadata?.device_type || 'unknown';
        
        const key = `${hour}:00`;
        if (!hourlyDeviceData.has(key)) {
          hourlyDeviceData.set(key, {
            hour: key,
            mobile: 0,
            desktop: 0,
            tablet: 0,
            total: 0,
          });
        }
        
        const entry = hourlyDeviceData.get(key);
        if (deviceType.includes('mobile') || deviceType.includes('phone')) {
          entry.mobile++;
        } else if (deviceType.includes('tablet')) {
          entry.tablet++;
        } else {
          entry.desktop++;
        }
        entry.total++;
      });

      // Convert to array and sort by hour
      const chartData = Array.from(hourlyDeviceData.values())
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

      // Calculate device totals
      const totals = {
        mobile: chartData.reduce((sum, item) => sum + item.mobile, 0),
        desktop: chartData.reduce((sum, item) => sum + item.desktop, 0),
        tablet: chartData.reduce((sum, item) => sum + item.tablet, 0),
      };

      return {
        chartData,
        totals,
        totalInteractions: data?.length || 0,
      };
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad por Dispositivo</CardTitle>
          <CardDescription>Distribución por hora</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const deviceIcons = {
    mobile: <Smartphone className="h-4 w-4" />,
    desktop: <Monitor className="h-4 w-4" />,
    tablet: <Tablet className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Uso por Dispositivo</CardTitle>
          <CardDescription>Distribución de interacciones por tipo de dispositivo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Object.entries(deviceData?.totals || {}).map(([device, count]) => (
              <div key={device} className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {deviceIcons[device as keyof typeof deviceIcons]}
                </div>
                <div className="text-2xl font-bold text-foreground">{count}</div>
                <div className="text-xs text-muted-foreground capitalize">{device}</div>
                <div className="text-xs text-muted-foreground">
                  {deviceData?.totalInteractions ? 
                    ((count / deviceData.totalInteractions) * 100).toFixed(1) : 0}%
                </div>
              </div>
            ))}
          </div>
          
          <ChartContainer config={chartConfig} className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceData?.chartData || []} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-md">
                          <p className="font-semibold">{label}</p>
                          <div className="space-y-1">
                            <p className="text-sm flex items-center gap-2">
                              <Smartphone className="h-3 w-3" />
                              Móvil: {payload.find(p => p.dataKey === 'mobile')?.value || 0}
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <Monitor className="h-3 w-3" />
                              Desktop: {payload.find(p => p.dataKey === 'desktop')?.value || 0}
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <Tablet className="h-3 w-3" />
                              Tablet: {payload.find(p => p.dataKey === 'tablet')?.value || 0}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="mobile" stackId="devices" fill="hsl(var(--chart-1))" />
                <Bar dataKey="desktop" stackId="devices" fill="hsl(var(--chart-2))" />
                <Bar dataKey="tablet" stackId="devices" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}