
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Ban, Eye, Lock } from 'lucide-react';

export function SecurityPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Seguridad y Detección de Fraude</h2>
          <p className="text-gray-600">Sistema de monitoreo y prevención de actividades fraudulentas</p>
        </div>
      </div>

      {/* Alertas de seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-900">5</div>
                <p className="text-sm text-red-700">Alertas Críticas</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-900">12</div>
                <p className="text-sm text-orange-700">IPs Bloqueadas</p>
              </div>
              <Ban className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-900">3</div>
                <p className="text-sm text-blue-700">Cuentas Suspendidas</p>
              </p>
            </div>
            <Lock className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-900">98.7%</div>
                <p className="text-sm text-green-700">Salud Sistema</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas activas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Alertas de Seguridad Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Múltiples intentos de login fallidos</strong>
                    <p className="text-sm mt-1">IP: 192.168.1.100 - 15 intentos en 5 minutos</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Investigar
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Ban className="h-4 w-4 mr-1" />
                      Bloquear IP
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Usuario creando múltiples restaurantes</strong>
                    <p className="text-sm mt-1">usuario@suspicious.com - 8 restaurantes en 1 hora</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Revisar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Lock className="h-4 w-4 mr-1" />
                      Suspender
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Panel de monitoreo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>IPs Más Activas (Últimas 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">192.168.1.100</div>
                  <div className="text-sm text-gray-600">Madrid, España</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">1,247 requests</div>
                  <Badge variant="destructive" className="text-xs">Sospechosa</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">10.0.0.45</div>
                  <div className="text-sm text-gray-600">Barcelona, España</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">892 requests</div>
                  <Badge variant="outline" className="text-xs">Normal</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad de Cuentas Sospechosas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                <div>
                  <div className="font-medium">suspicious@email.com</div>
                  <div className="text-sm text-red-600">8 restaurantes creados hoy</div>
                </div>
                <Badge variant="destructive" className="text-xs">Alta prioridad</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                <div>
                  <div className="font-medium">fake@restaurant.com</div>
                  <div className="text-sm text-yellow-600">Contenido duplicado detectado</div>
                </div>
                <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">Media prioridad</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
