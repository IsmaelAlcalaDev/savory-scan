
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Store, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  MapPin
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const mockMetrics = {
  totalUsers: 15429,
  totalRestaurants: 2847,
  totalRevenue: 89340,
  monthlyGrowth: 12.5,
  activeVerifications: 23,
  pendingModerations: 8,
  systemHealth: 98.7,
  todayViews: 45782
};

const revenueData = [
  { month: 'Ene', revenue: 42000, users: 1200 },
  { month: 'Feb', revenue: 45000, users: 1400 },
  { month: 'Mar', revenue: 48000, users: 1600 },
  { month: 'Abr', revenue: 52000, users: 1800 },
  { month: 'May', revenue: 58000, users: 2100 },
  { month: 'Jun', revenue: 65000, users: 2400 },
];

const cityData = [
  { name: 'Madrid', value: 35, color: '#3b82f6' },
  { name: 'Barcelona', value: 28, color: '#06b6d4' },
  { name: 'Valencia', value: 15, color: '#10b981' },
  { name: 'Sevilla', value: 12, color: '#f59e0b' },
  { name: 'Otros', value: 10, color: '#8b5cf6' },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{mockMetrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">
              +180 nuevos esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Restaurantes Activos</CardTitle>
            <Store className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{mockMetrics.totalRestaurants.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">
              +47 verificados este mes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">€{mockMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-yellow-600 mt-1">
              +{mockMetrics.monthlyGrowth}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Vistas Hoy</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{mockMetrics.todayViews.toLocaleString()}</div>
            <p className="text-xs text-purple-600 mt-1">
              +8.2% vs ayer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y estado del sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas Activas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-900">Verificaciones Pendientes</p>
                <p className="text-xs text-red-600">{mockMetrics.activeVerifications} restaurantes esperando</p>
              </div>
              <Badge variant="destructive">{mockMetrics.activeVerifications}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-900">Moderaciones</p>
                <p className="text-xs text-yellow-600">{mockMetrics.pendingModerations} reportes por revisar</p>
              </div>
              <Badge variant="outline" className="border-yellow-300 text-yellow-700">{mockMetrics.pendingModerations}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Salud General</span>
                <span className="font-medium">{mockMetrics.systemHealth}%</span>
              </div>
              <Progress value={mockMetrics.systemHealth} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">99.9%</div>
                <div className="text-xs text-green-700">Uptime</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">1.2s</div>
                <div className="text-xs text-blue-700">Resp. Media</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Distribución Geográfica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cityData.map((city, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: city.color }}
                    />
                    <span className="text-sm">{city.name}</span>
                  </div>
                  <span className="text-sm font-medium">{city.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `€${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Ingresos' : 'Usuarios'
                ]} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nuevo restaurante registrado</p>
                <p className="text-xs text-gray-600">Casa Pepe - Madrid Centro</p>
              </div>
              <span className="text-xs text-gray-500">Hace 5 min</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Verificación completada</p>
                <p className="text-xs text-gray-600">La Taberna del Puerto - Valencia</p>
              </div>
              <span className="text-xs text-gray-500">Hace 12 min</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Reporte de moderación</p>
                <p className="text-xs text-gray-600">Contenido inapropiado reportado</p>
              </div>
              <span className="text-xs text-gray-500">Hace 18 min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
