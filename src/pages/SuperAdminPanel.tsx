import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  BarChart3, 
  Users, 
  Store, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function SuperAdminPanel() {
  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlResult, setSqlResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const executeSQLQuery = async () => {
    if (!sqlQuery.trim()) return;

    setIsExecuting(true);
    try {
      // Simulate SQL execution - in real app, this would go through a secure backend
      // For demo purposes, we'll just simulate responses
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (sqlQuery.toLowerCase().includes('select')) {
        setSqlResult({
          success: true,
          message: 'Query ejecutado exitosamente',
          data: 'Simulación: SELECT queries no están permitidos en esta demo'
        });
      } else if (sqlQuery.toLowerCase().includes('insert')) {
        setSqlResult({
          success: true,
          message: 'INSERT ejecutado exitosamente. 1 fila afectada.',
        });
      } else {
        setSqlResult({
          success: false,
          message: 'Error: Solo se permiten queries INSERT en esta demo'
        });
      }
    } catch (error) {
      setSqlResult({
        success: false,
        message: 'Error ejecutando la query: ' + (error as Error).message
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Mock data for demonstration
  const mockStats = {
    totalRestaurants: 1247,
    activeRestaurants: 892,
    totalUsers: 15678,
    todaySignups: 34,
    totalDishes: 8932,
    totalTickets: 2456
  };

  return (
    <>
      <Helmet>
        <title>SuperAdmin Panel | SavorySearch</title>
        <meta name="description" content="Panel de administración para gestionar la plataforma SavorySearch" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-gradient-hero border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  SuperAdmin Panel
                </h1>
                <p className="text-primary-foreground/80">
                  Gestión y análisis de la plataforma
                </p>
              </div>
              <Badge variant="outline" className="bg-glass border-glass text-primary-foreground">
                Admin v1.0
              </Badge>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="sql">SQL Injection</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-card border-glass shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Restaurantes</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.totalRestaurants}</div>
                    <p className="text-xs text-muted-foreground">
                      {mockStats.activeRestaurants} activos
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-glass shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      +{mockStats.todaySignups} hoy
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-glass shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Platos</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.totalDishes}</div>
                    <p className="text-xs text-muted-foreground">
                      En {mockStats.activeRestaurants} restaurantes
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sql" className="space-y-6">
              <Card className="bg-gradient-card border-glass shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Sistema de Inyección SQL
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>¡Precaución!</strong> Este sistema permite ejecutar comandos SQL directamente en la base de datos. 
                      Solo usa INSERT statements para cargar datos. Otros comandos están restringidos por seguridad.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sql-query">Query SQL</Label>
                      <Textarea
                        id="sql-query"
                        placeholder="INSERT INTO restaurants (name, slug, description, ...) VALUES (...);"
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        rows={8}
                        className="font-mono text-sm bg-background/50 border-glass"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="search" 
                        onClick={executeSQLQuery}
                        disabled={isExecuting || !sqlQuery.trim()}
                      >
                        {isExecuting ? (
                          <>Ejecutando...</>
                        ) : (
                          <>
                            <Database className="h-4 w-4 mr-2" />
                            Ejecutar Query
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setSqlQuery('')}
                      >
                        Limpiar
                      </Button>
                    </div>

                    {sqlResult && (
                      <Alert className={sqlResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                        {sqlResult.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription>
                          <strong>{sqlResult.success ? 'Éxito:' : 'Error:'}</strong> {sqlResult.message}
                          {sqlResult.data && (
                            <pre className="mt-2 text-xs bg-white/50 p-2 rounded overflow-auto">
                              {JSON.stringify(sqlResult.data, null, 2)}
                            </pre>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-glass shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Ejemplos de Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">Insertar Restaurante:</h4>
                      <code className="text-xs bg-muted p-2 rounded block mt-1">
                        INSERT INTO restaurants (name, slug, description, establishment_type_id, city_id, address) 
                        VALUES ('El Rincón Andaluz', 'el-rincon-andaluz', 'Auténtica cocina tradicional', 1, 1, 'Calle Sierpes 123');
                      </code>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Insertar Plato:</h4>
                      <code className="text-xs bg-muted p-2 rounded block mt-1">
                        INSERT INTO dishes (restaurant_id, section_id, category_id, name, base_price, description) 
                        VALUES (1, 1, 1, 'Paella Valenciana', 18.50, 'Arroz con pollo, verduras y azafrán');
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-card border-glass shadow-card">
                  <CardHeader>
                    <CardTitle>Métricas de Búsqueda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Total búsquedas hoy:</span>
                        <span className="font-medium">2,847</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Búsquedas sin resultados:</span>
                        <span className="font-medium">127</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Conversión a visita:</span>
                        <span className="font-medium">34.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-glass shadow-card">
                  <CardHeader>
                    <CardTitle>Simulador de Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Tickets simulados hoy:</span>
                        <span className="font-medium">1,453</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Importe promedio:</span>
                        <span className="font-medium">€24.80</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Tickets guardados:</span>
                        <span className="font-medium">312</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="bg-gradient-card border-glass shadow-card">
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Módulo en desarrollo</h3>
                    <p className="text-muted-foreground">
                      La gestión de usuarios estará disponible en la siguiente versión.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}