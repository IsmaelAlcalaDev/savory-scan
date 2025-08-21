import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, Users, Search, Heart, Store, UtensilsCrossed } from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import ActivityChart from '@/components/analytics/ActivityChart';
import TopRestaurantsChart from '@/components/analytics/TopRestaurantsChart';
import SearchAnalyticsChart from '@/components/analytics/SearchAnalyticsChart';
import LocationAnalytics from '@/components/analytics/LocationAnalytics';
import DeviceAnalytics from '@/components/analytics/DeviceAnalytics';
import RealtimeMetrics from '@/components/analytics/RealtimeMetrics';

export default function Analytics() {
  const { data: metrics, isLoading } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics - Panel de Métricas</title>
        <meta name="description" content="Panel de métricas y analytics del directorio de restaurantes y platos" />
      </Helmet>
      
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Métricas y análisis del directorio de restaurantes y platos
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              En tiempo real
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visitas de Página</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics?.overview?.pageVisits || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{metrics?.overview?.pageVisitsChange || 0}% desde ayer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Únicos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics?.overview?.uniqueUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{metrics?.overview?.uniqueUsersChange || 0}% desde ayer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Búsquedas</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics?.overview?.searches || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{metrics?.overview?.searchesChange || 0}% desde ayer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics?.overview?.favorites || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{metrics?.overview?.favoritesChange || 0}% desde ayer
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Realtime Metrics */}
          <RealtimeMetrics />

          {/* Main Analytics Tabs */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Actividad
              </TabsTrigger>
              <TabsTrigger value="restaurants" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Restaurantes
              </TabsTrigger>
              <TabsTrigger value="dishes" className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Platos
              </TabsTrigger>
              <TabsTrigger value="searches" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Búsquedas
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuarios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActivityChart />
                <DeviceAnalytics />
              </div>
            </TabsContent>

            <TabsContent value="restaurants" className="space-y-6">
              <TopRestaurantsChart />
            </TabsContent>

            <TabsContent value="dishes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Platos</CardTitle>
                  <CardDescription>
                    Platos más populares y tendencias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Próximamente...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="searches" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SearchAnalyticsChart />
                <LocationAnalytics />
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Usuarios</CardTitle>
                  <CardDescription>
                    Comportamiento y patrones de usuarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Próximamente...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}