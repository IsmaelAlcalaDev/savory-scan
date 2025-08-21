import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, TrendingUp } from 'lucide-react';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function SearchAnalyticsChart() {
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['search-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_analytics')
        .select('search_query, cuisine_types, location_query, filters_applied')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Analyze search patterns
      const queryFrequency = new Map();
      const cuisineFrequency = new Map();
      const filterUsage = new Map();
      
      data?.forEach(search => {
        // Count search queries
        if (search.search_query && search.search_query.trim()) {
          const query = search.search_query.toLowerCase().trim();
          queryFrequency.set(query, (queryFrequency.get(query) || 0) + 1);
        }
        
        // Count cuisine types
        if (search.cuisine_types && Array.isArray(search.cuisine_types)) {
          search.cuisine_types.forEach((cuisineId: number) => {
            cuisineFrequency.set(cuisineId, (cuisineFrequency.get(cuisineId) || 0) + 1);
          });
        }
        
        // Count filter usage
        if (search.filters_applied && typeof search.filters_applied === 'object') {
          Object.keys(search.filters_applied).forEach(filter => {
            filterUsage.set(filter, (filterUsage.get(filter) || 0) + 1);
          });
        }
      });

      // Get top searches
      const topQueries = Array.from(queryFrequency.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({
          name: query.charAt(0).toUpperCase() + query.slice(1),
          value: count,
        }));

      // Get filter usage data
      const filtersData = Array.from(filterUsage.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([filter, count]) => ({
          name: filter.charAt(0).toUpperCase() + filter.slice(1),
          value: count,
        }));

      return {
        topQueries,
        filtersData,
        totalSearches: data?.length || 0,
        uniqueQueries: queryFrequency.size,
      };
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Búsquedas</CardTitle>
          <CardDescription>Patrones de búsqueda</CardDescription>
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
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Consultas Más Populares
          </CardTitle>
          <CardDescription>Últimos 7 días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={{}} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={searchData?.topQueries || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      percent > 5 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {searchData?.topQueries?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-md">
                            <p className="font-semibold">{payload[0].name}</p>
                            <p className="text-sm text-muted-foreground">
                              {payload[0].value} búsquedas
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Estadísticas de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total de búsquedas</span>
              <Badge variant="secondary">{searchData?.totalSearches || 0}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Consultas únicas</span>
              <Badge variant="outline">{searchData?.uniqueQueries || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filtros Más Usados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchData?.filtersData?.slice(0, 5).map((filter, index) => (
                <div key={filter.name} className="flex justify-between items-center">
                  <span className="text-sm">{filter.name}</span>
                  <Badge variant="outline">{filter.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}