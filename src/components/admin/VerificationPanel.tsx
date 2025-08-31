
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, MessageSquare } from 'lucide-react';

const mockVerifications = [
  {
    id: 1,
    restaurant: 'Casa Pepe',
    owner: 'Carlos Rodríguez',
    submittedDate: '2024-01-18',
    status: 'pending',
    priority: 'high',
    documents: 3,
    notes: 'Documentos completos'
  },
  {
    id: 2,
    restaurant: 'La Taberna',
    owner: 'Ana García',
    submittedDate: '2024-01-17',
    status: 'review',
    priority: 'medium',
    documents: 2,
    notes: 'Falta licencia municipal'
  }
];

export function VerificationPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Panel de Verificación</h2>
          <p className="text-gray-600">Gestiona las solicitudes de verificación de restaurantes</p>
        </div>
      </div>

      {/* Estadísticas de verificación */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-900">23</div>
                <p className="text-sm text-orange-700">Pendientes</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-900">8</div>
                <p className="text-sm text-blue-700">En Revisión</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-900">189</div>
                <p className="text-sm text-green-700">Aprobados</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-900">12</div>
                <p className="text-sm text-red-700">Rechazados</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cola de verificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Cola de Verificaciones Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockVerifications.map((verification) => (
              <div key={verification.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">{verification.restaurant}</h3>
                      <p className="text-sm text-gray-600">Propietario: {verification.owner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={verification.priority === 'high' ? 'destructive' : 'secondary'}>
                      {verification.priority === 'high' ? 'Alta Prioridad' : 'Prioridad Media'}
                    </Badge>
                    <Badge variant="outline">
                      {verification.status === 'pending' ? 'Pendiente' : 'En Revisión'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Enviado: {verification.submittedDate}</span>
                    <span>Documentos: {verification.documents}</span>
                    <span>Notas: {verification.notes}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Revisar
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Contactar
                    </Button>
                    <Button size="sm" variant="default">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
