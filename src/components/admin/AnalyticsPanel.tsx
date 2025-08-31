
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, MapPin, Clock, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const mockAnalytics = {
  totalViews: 847293,
  uniqueUsers: 123456,
  avgSessionTime: 245,
  bounceRate: 34.2,
  conversionRate: 2.8
};

export function AnalyticsPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Métricas y Analytics</h2>
          <p className="text-gray-600">Análisis completo del comportamiento y rendimiento</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockAnalytics.totalViews.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Vistas Totales</p>
            <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700">+12.5%</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockAnalytics.uniqueUsers.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Usuarios Únicos</p>
            <Badge variant="outline" className="mt-1 text-xs bg-blue-50 text-blue-700">+8.3%</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockAnalytics.avgSessionTime}s</div>
            <p className="text-sm text-gray-600">Sesión Media</p>
            <Badge variant="outline" className="mt-1 text-xs bg-purple-50 text-purple-700">+15.2%</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockAnalytics.bounceRate}%</div>
            <p className="text-sm text-gray-600">Tasa Rebote</p>
            <Badge variant="outline" className="mt-1 text-xs bg-orange-50 text-orange-700">-3.1%</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockAnalytics.conversionRate}%</div>
            <p className="text-sm text-gray-600">Conversión</p>
            <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700">+0.8%</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Análisis por ubicación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Tráfico por Ciudades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Madrid</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">287,432</div>
                  <div className="text-xs text-gray-600">34.2% del total</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Barcelona</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">198,765</div>
                  <div className="text-xs text-gray-600">23.7% del total</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Valencia</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">134,521</div>
                  <div className="text-xs text-gray-600">16.1% del total</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horas Pico de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">13:00-15:00</div>
                  <p className="text-sm text-orange-700">Pico Almuerzo</p>
                  <p className="text-xs text-orange-600">45% más actividad</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">20:00-22:00</div>
                  <p className="text-sm text-purple-700">Pico Cena</p>
                  <p className="text-xs text-purple-600">62% más actividad</p>
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-600">Fin de Semana</div>
                <p className="text-sm text-gray-700">+78% más búsquedas</p>
                <p className="text-xs text-gray-600">Especialmente sábados por la noche</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Tipos de Contenido Más Vistos</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Perfiles de Restaurantes</span>
                  <span className="text-sm font-medium">45.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Menús y Platos</span>
                  <span className="text-sm font-medium">38.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Búsquedas</span>
                  <span className="text-sm font-medium">16.1%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Acciones Más Frecuentes</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Guardar Restaurante</span>
                  <span className="text-sm font-medium">28.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ver Menú Completo</span>
                  <span className="text-sm font-medium">23.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Compartir</span>
                  <span className="text-sm font-medium">12.3%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Dispositivos</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Móvil</span>
                  <span className="text-sm font-medium">68.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Desktop</span>
                  <span className="text-sm font-medium">24.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tablet</span>
                  <span className="text-sm font-medium">6.4%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
