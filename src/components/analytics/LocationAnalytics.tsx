import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, TrendingUp, Users } from 'lucide-react';

export default function LocationAnalytics() {
  const { data: locationData, isLoading } = useQuery({
    queryKey: ['location-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_analytics')
        .select('location_query, user_id')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Analyze location patterns
      const locationFrequency = new Map();
      const uniqueUsers = new Set();
      
      data?.forEach(search => {
        uniqueUsers.add(search.user_id);
        
        if (search.location_query && search.location_query.trim()) {
          const location = search.location_query.toLowerCase().trim();
          locationFrequency.set(location, (locationFrequency.get(location) || 0) + 1);
        }
      });

      // Get top locations
      const topLocations = Array.from(locationFrequency.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([location, count]) => ({
          name: location.charAt(0).toUpperCase() + location.slice(1),
          searches: count,
          percentage: ((count / data?.length || 1) * 100).toFixed(1),
        }));

      return {
        topLocations,
        totalLocationSearches: Array.from(locationFrequency.values()).reduce((a, b) => a + b, 0),
        uniqueLocations: locationFrequency.size,
        uniqueUsers: uniqueUsers.size,
      };
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Ubicaciones</CardTitle>
          <CardDescription>Búsquedas por ubicación</CardDescription>
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
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Ubicaciones Más Buscadas
        </CardTitle>
        <CardDescription>Últimos 7 días</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {locationData?.totalLocationSearches || 0}
            </div>
            <div className="text-xs text-muted-foreground">Total búsquedas</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {locationData?.uniqueLocations || 0}
            </div>
            <div className="text-xs text-muted-foreground">Ubicaciones únicas</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {locationData?.uniqueUsers || 0}
            </div>
            <div className="text-xs text-muted-foreground">Usuarios únicos</div>
          </div>
        </div>

        {/* Top Locations List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="h-4 w-4" />
            Ranking de Ubicaciones
          </div>
          
          {locationData?.topLocations?.map((location, index) => (
            <div key={location.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-foreground">{location.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {location.percentage}% del total
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {location.searches}
                </Badge>
              </div>
            </div>
          ))}
          
          {(!locationData?.topLocations || locationData.topLocations.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay datos de ubicaciones disponibles</p>
              <p className="text-xs">Las búsquedas por ubicación aparecerán aquí</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}