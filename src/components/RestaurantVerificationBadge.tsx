
import { Shield, ShieldCheck, ShieldAlert, ShieldX, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RestaurantVerificationBadgeProps {
  verificationLevel: 'basic' | 'standard' | 'premium';
  verificationStatus: 'pending' | 'in_review' | 'verified' | 'rejected' | 'disputed' | 'suspended';
  verificationScore?: number;
  className?: string;
}

export default function RestaurantVerificationBadge({
  verificationLevel,
  verificationStatus,
  verificationScore = 0,
  className = ""
}: RestaurantVerificationBadgeProps) {
  const getVerificationInfo = () => {
    if (verificationStatus === 'verified') {
      switch (verificationLevel) {
        case 'premium':
          return {
            icon: ShieldCheck,
            color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            label: 'Verificado Premium',
            description: 'Restaurante verificado con inspección física y documentación completa'
          };
        case 'standard':
          return {
            icon: Shield,
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            label: 'Verificado Estándar',
            description: 'Restaurante verificado con documentación oficial'
          };
        case 'basic':
          return {
            icon: Shield,
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            label: 'Verificado Básico',
            description: 'Información básica verificada automáticamente'
          };
      }
    }

    switch (verificationStatus) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Pendiente',
          description: 'Solicitud de verificación pendiente de revisión'
        };
      case 'in_review':
        return {
          icon: Shield,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'En Revisión',
          description: 'Verificación en proceso de revisión manual'
        };
      case 'rejected':
        return {
          icon: ShieldX,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Rechazado',
          description: 'Solicitud de verificación rechazada'
        };
      case 'disputed':
        return {
          icon: AlertTriangle,
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          label: 'En Disputa',
          description: 'Múltiples reclamaciones - requiere mediación'
        };
      case 'suspended':
        return {
          icon: ShieldAlert,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Suspendido',
          description: 'Verificación suspendida temporalmente'
        };
      default:
        return {
          icon: Shield,
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          label: 'Sin Verificar',
          description: 'Restaurante sin verificación'
        };
    }
  };

  const { icon: Icon, color, label, description } = getVerificationInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={`${color} ${className} flex items-center gap-1 text-xs`}>
            <Icon className="h-3 w-3" />
            {label}
            {verificationScore > 0 && verificationStatus === 'verified' && (
              <span className="ml-1 text-xs opacity-75">({verificationScore}%)</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
            {verificationScore > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Puntuación: {verificationScore}/100
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
