import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Heart, MapPin } from 'lucide-react';

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "hsl(var(--chart-1))",
  },
  favorites: {
    label: "Favoritos",
    color: "hsl(var(--chart-2))",
  },
};

export default function TopRestaurantsChart() {
  const { data: topRestaurants, isLoading } = useQuery({
    queryKey: ['top-restaurants'],
    queryFn: async () => {
      // Get restaurants with most analytics activity
      const { data, error } = await supabase
        .from('analytics_events')
        .select('restaurant_id, event_type')
        .not('restaurant_id', 'is', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Count events by restaurant
      const restaurantStats = new Map();
      
      data?.forEach(event => {
        const restaurantId = event.restaurant_id;
        if (!restaurantStats.has(restaurantId)) {
          restaurantStats.set(restaurantId, {
            restaurant_id: restaurantId,
            clicks: 0,
            favorites: 0,
            total: 0,
          });
        }
        
        const stats = restaurantStats.get(restaurantId);
        if (event.event_type.includes('click') || event.event_type.includes('view')) {
          stats.clicks++;
        }
        if (event.event_type.includes('favorite')) {
          stats.favorites++;
        }
        stats.total++;
      });

      // Get restaurant details for top performers
      const topIds = Array.from(restaurantStats.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map(r => r.restaurant_id);

      if (topIds.length === 0) {
        return [];
      }

      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id, name, slug, city_id, cities(name)')
        .in('id', topIds);

      if (restaurantsError) throw restaurantsError;

      // Combine data
      return restaurants?.map(restaurant => ({
        ...restaurant,
        ...restaurantStats.get(restaurant.id),
        name: restaurant.name.length > 20 ? 
          restaurant.name.substring(0, 20) + '...' : 
          restaurant.name
      })) || [];
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Restaurantes Más Populares</CardTitle>
          <CardDescription>Últimos 7 días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Restaurantes Más Populares</CardTitle>
          <CardDescription>Basado en clicks y interacciones - Últimos 7 días</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRestaurants} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="clicks" 
                  fill="var(--color-clicks)" 
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="favorites" 
                  fill="var(--color-favorites)" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Restaurantes</CardTitle>
          <CardDescription>Información detallada de rendimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRestaurants?.slice(0, 5).map((restaurant, index) => (
              <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{restaurant.name}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {restaurant.cities?.name || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {restaurant.clicks || 0}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {restaurant.favorites || 0}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}