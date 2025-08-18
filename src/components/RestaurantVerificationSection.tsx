
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRestaurantVerification } from '@/hooks/useRestaurantVerification';
import RestaurantVerificationBadge from './RestaurantVerificationBadge';
import VerificationRequestModal from './VerificationRequestModal';
import { Shield, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RestaurantVerificationSectionProps {
  restaurantId: number;
  restaurantName: string;
  verificationLevel?: 'basic' | 'standard' | 'premium';
  verificationStatus?: 'pending' | 'in_review' | 'verified' | 'rejected' | 'disputed' | 'suspended';
  verificationScore?: number;
}

export default function RestaurantVerificationSection({
  restaurantId,
  restaurantName,
  verificationLevel = 'basic',
  verificationStatus = 'pending',
  verificationScore = 0
}: RestaurantVerificationSectionProps) {
  const { requests, loading } = useRestaurantVerification();
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Filtrar solicitudes para este restaurante
  const restaurantRequests = requests.filter(req => req.restaurant_id === restaurantId);
  const latestRequest = restaurantRequests[0];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'in_review':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'disputed':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      in_review: 'En Revisión',
      verified: 'Verificado',
      rejected: 'Rechazado',
      disputed: 'En Disputa',
      suspended: 'Suspendido'
    };
    return labels[status as keyof typeof labels] || 'Desconocido';
  };

  const canRequestVerification = !latestRequest || 
    latestRequest.current_status === 'rejected' || 
    latestRequest.current_status === 'suspended';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Estado de Verificación
            </CardTitle>
            <CardDescription>
              Gestiona la verificación de autenticidad de tu restaurante
            </CardDescription>
          </div>
          <RestaurantVerificationBadge
            verificationLevel={verificationLevel}
            verificationStatus={verificationStatus}
            verificationScore={verificationScore}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Información actual */}
        <div className="space-y-3">
          <h4 className="font-medium">Estado Actual</h4>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon(verificationStatus)}
            <div className="flex-1">
              <p className="font-medium">{getStatusLabel(verificationStatus)}</p>
              {verificationScore > 0 && (
                <p className="text-sm text-muted-foreground">
                  Puntuación de verificación: {verificationScore}/100
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Solicitudes de verificación */}
        {restaurantRequests.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium">Historial de Solicitudes</h4>
              <div className="space-y-2">
                {restaurantRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.current_status)}
                      <div>
                        <p className="font-medium">
                          Verificación {request.requested_level.charAt(0).toUpperCase() + request.requested_level.slice(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {getStatusLabel(request.current_status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Información sobre niveles de verificación */}
        <Separator />
        <div className="space-y-3">
          <h4 className="font-medium">Niveles de Verificación</h4>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-medium">Básico</p>
                <p className="text-sm text-muted-foreground">
                  Verificación automática de información básica
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Estándar</p>
                <p className="text-sm text-muted-foreground">
                  Verificación manual con documentos oficiales
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Shield className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium">Premium</p>
                <p className="text-sm text-muted-foreground">
                  Verificación exhaustiva con inspección física
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        {canRequestVerification && (
          <>
            <Separator />
            <div className="flex justify-end">
              <Button onClick={() => setShowRequestModal(true)}>
                {latestRequest ? 'Nueva Solicitud' : 'Solicitar Verificación'}
              </Button>
            </div>
          </>
        )}

        {/* Modal de solicitud */}
        <VerificationRequestModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
        />
      </CardContent>
    </Card>
  );
}
