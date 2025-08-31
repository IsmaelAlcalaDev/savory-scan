
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Download, Filter } from 'lucide-react';

const mockLogs = [
  {
    id: 1,
    timestamp: '2024-01-18 14:35:22',
    user: 'admin@foodiespot.com',
    action: 'restaurant_verified',
    resource: 'Restaurant #1247',
    ip: '192.168.1.100',
    details: 'Verified Casa Pepe restaurant'
  },
  {
    id: 2,
    timestamp: '2024-01-18 14:32:15',
    user: 'moderator@foodiespot.com',
    action: 'content_moderated',
    resource: 'Review #5678',
    ip: '10.0.0.45',
    details: 'Removed inappropriate content'
  },
  {
    id: 3,
    timestamp: '2024-01-18 14:28:33',
    user: 'superadmin@foodiespot.com',
    action: 'user_role_changed',
    resource: 'User #9876',
    ip: '172.16.0.1',
    details: 'Changed role from user to restaurant_owner'
  }
];

export function AuditLogs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Logs y Auditoría</h2>
          <p className="text-gray-600">Registro completo de todas las acciones administrativas</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Logs
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar en logs..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar por Usuario
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar por Acción
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Rango de Fechas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de audit */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">15,847</div>
            <p className="text-sm text-gray-600">Total Eventos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">247</div>
            <p className="text-sm text-gray-600">Eventos Hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-gray-600">Usuarios Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-sm text-gray-600">Integridad Logs</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registro de Auditoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {log.action}
                    </Badge>
                    <span className="text-sm font-medium">{log.timestamp}</span>
                  </div>
                  <span className="text-xs text-gray-500">IP: {log.ip}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Usuario:</span>
                    <div className="font-medium">{log.user}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Recurso:</span>
                    <div className="font-medium">{log.resource}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Detalles:</span>
                    <div className="text-gray-700">{log.details}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-6">
            <Button variant="outline">Cargar Más Logs</Button>
          </div>
        </CardContent>
      </Card>

      {/* Eventos críticos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Críticos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <div className="font-medium text-red-900">Intento de acceso no autorizado</div>
                <div className="text-sm text-red-600">IP: 192.168.1.999 intentó acceder al panel admin</div>
              </div>
              <span className="text-xs text-red-500">Hace 2 horas</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <div className="font-medium text-yellow-900">Cambio masivo de datos</div>
                <div className="text-sm text-yellow-600">157 restaurantes modificados por admin@foodiespot.com</div>
              </div>
              <span className="text-xs text-yellow-500">Hace 4 horas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
