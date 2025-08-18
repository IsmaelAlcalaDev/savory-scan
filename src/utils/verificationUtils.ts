
import { VerificationLevel, VerificationStatus } from '@/types/verification';

export const getVerificationPriority = (
  level: VerificationLevel,
  status: VerificationStatus,
  score: number
): number => {
  // Solo restaurantes verificados obtienen prioridad
  if (status !== 'verified') return 0;

  let basePriority = 0;
  
  switch (level) {
    case 'premium':
      basePriority = 100;
      break;
    case 'standard':
      basePriority = 75;
      break;
    case 'basic':
      basePriority = 50;
      break;
  }

  // Ajustar por score (0-100)
  const scoreMultiplier = score / 100;
  return Math.floor(basePriority * scoreMultiplier);
};

export const getVerificationRequirements = (level: VerificationLevel): string[] => {
  switch (level) {
    case 'basic':
      return [
        'Información básica completa',
        'Datos de contacto válidos',
        'Ubicación verificada',
        'Al menos una imagen del local'
      ];
    case 'standard':
      return [
        'Todos los requisitos básicos',
        'Licencia comercial',
        'Certificado de impuestos',
        'Documento de identidad del propietario',
        'Fotos del menú actual',
        'Fotos del interior del local'
      ];
    case 'premium':
      return [
        'Todos los requisitos estándar',
        'Inspección física del local',
        'Verificación de documentos en persona',
        'Entrevista con el propietario/gerente',
        'Verificación de higiene y seguridad',
        'Validación de información con autoridades locales'
      ];
    default:
      return [];
  }
};

export const getVerificationBenefits = (level: VerificationLevel): string[] => {
  switch (level) {
    case 'basic':
      return [
        'Badge de verificación básica',
        'Aparición en resultados generales',
        'Información básica validada'
      ];
    case 'standard':
      return [
        'Todos los beneficios básicos',
        'Badge de verificación estándar',
        'Prioridad en resultados de búsqueda',
        'Mayor confianza de los usuarios',
        'Destacado como "Verificado"'
      ];
    case 'premium':
      return [
        'Todos los beneficios estándar',
        'Badge de verificación premium dorado',
        'Máxima prioridad en resultados',
        'Sello de "Establecimiento de Confianza"',
        'Promoción especial en la plataforma',
        'Soporte prioritario'
      ];
    default:
      return [];
  }
};

export const formatVerificationStatus = (status: VerificationStatus): string => {
  const statusMap = {
    pending: 'Pendiente de Revisión',
    in_review: 'En Proceso de Verificación',
    verified: 'Verificado ✓',
    rejected: 'Rechazado',
    disputed: 'En Disputa - Requiere Mediación',
    suspended: 'Verificación Suspendida'
  };
  
  return statusMap[status] || 'Estado Desconocido';
};

export const getVerificationColor = (
  level: VerificationLevel,
  status: VerificationStatus
): string => {
  if (status !== 'verified') {
    const statusColors = {
      pending: 'text-yellow-600',
      in_review: 'text-blue-600',
      rejected: 'text-red-600',
      disputed: 'text-orange-600',
      suspended: 'text-red-600'
    };
    return statusColors[status as keyof typeof statusColors] || 'text-gray-600';
  }

  const levelColors = {
    basic: 'text-gray-600',
    standard: 'text-blue-600',
    premium: 'text-emerald-600'
  };
  
  return levelColors[level];
};
