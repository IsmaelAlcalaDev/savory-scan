import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const chartConfig = {
  visits: {
    label: "Visitas",
    color: "hsl(var(--chart-1))",
  },
  interactions: {
    label: "Interacciones", 
    color: "hsl(var(--chart-2))",
  },
  searches: {
    label: "Búsquedas",
    color: "hsl(var(--chart-3))",
  },
};

export default function ActivityChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['activity-chart'],
    queryFn: async () => {
      // Get activity data for the last 7 days, grouped by hour
      const { data, error } = await supabase
        .from('analytics_events')
        .select('created_at, event_type')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Group data by hour
      const hourlyData = new Map();
      
      data?.forEach(event => {
        const hour = new Date(event.created_at).getHours();
        const date = new Date(event.created_at).toDateString();
        const key = `${date} ${hour}:00`;
        
        if (!hourlyData.has(key)) {
          hourlyData.set(key, {
            time: key,
            visits: 0,
            interactions: 0,
            searches: 0,
          });
        }
        
        const entry = hourlyData.get(key);
        if (event.event_type.includes('page_view')) entry.visits++;
        if (event.event_type.includes('interaction')) entry.interactions++;
        if (event.event_type.includes('search')) entry.searches++;
      });

      return Array.from(hourlyData.values()).slice(-24); // Last 24 hours
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad por Hora</CardTitle>
          <CardDescription>Últimas 24 horas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad por Hora</CardTitle>
        <CardDescription>Últimas 24 horas</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const hour = value.split(' ')[1];
                  return hour;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="var(--color-visits)" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="interactions" 
                stroke="var(--color-interactions)" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="searches" 
                stroke="var(--color-searches)" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}