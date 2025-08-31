
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag, Eye, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

export function ModerationPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Moderación</h2>
          <p className="text-gray-600">Gestión de reportes y contenido inapropiado</p>
        </div>
      </div>

      {/* Estadísticas de moderación */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-900">23</div>
                <p className="text-sm text-orange-700">Reportes Pendientes</p>
              </div>
              <Flag className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">145</div>
            <p className="text-sm text-gray-600">Revisados Hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-gray-600">Contenido Eliminado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">5</div>
            <p className="text-sm text-gray-600">Usuarios Sancionados</p>
          </CardContent>
        </Card>
      </div>

      {/* Cola de moderación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Cola de Moderación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-red-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">Contenido Inapropiado - Casa Pepe</h4>
                  <p className="text-sm text-gray-600">Reportado por: usuario@example.com</p>
                </div>
                <Badge variant="destructive">Alta prioridad</Badge>
              </div>
              <div className="mb-3">
                <p className="text-sm"><strong>Motivo:</strong> Imágenes con contenido sexual explícito</p>
                <p className="text-sm"><strong>Descripción:</strong> Fotos de platos con contenido inapropiado</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Revisar Contenido
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Contactar Usuario
                </Button>
                <Button size="sm" variant="destructive">
                  <XCircle className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
                <Button size="sm" variant="default">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aprobar
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-yellow-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">Información Falsa - La Taberna</h4>
                  <p className="text-sm text-gray-600">Reportado por: otro@usuario.com</p>
                </div>
                <Badge variant="outline" className="border-yellow-300 text-yellow-700">Media prioridad</Badge>
              </div>
              <div className="mb-3">
                <p className="text-sm"><strong>Motivo:</strong> Dirección incorrecta</p>
                <p className="text-sm"><strong>Descripción:</strong> El restaurante no existe en esa dirección</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Verificar Ubicación
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Contactar Propietario
                </Button>
                <Button size="sm" variant="outline">
                  Editar Información
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Tipos de Reportes (Este mes)</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Contenido inapropiado</span>
                  <span className="text-sm font-medium">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Información falsa</span>
                  <span className="text-sm font-medium">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Spam</span>
                  <span className="text-sm font-medium">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Violación copyright</span>
                  <span className="text-sm font-medium">12</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Resoluciones</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Contenido eliminado</span>
                  <span className="text-sm font-medium">28</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Advertencia enviada</span>
                  <span className="text-sm font-medium">31</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sin acción necesaria</span>
                  <span className="text-sm font-medium">35</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Usuario suspendido</span>
                  <span className="text-sm font-medium">6</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Tiempo de Respuesta</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Promedio</span>
                  <span className="text-sm font-medium">4.2 horas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Casos críticos</span>
                  <span className="text-sm font-medium">1.1 horas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">SLA cumplido</span>
                  <span className="text-sm font-medium">94%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
