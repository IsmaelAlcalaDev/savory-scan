
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield } from 'lucide-react';

interface DietCertificationBadgesProps {
  certifications: string[];
  specializations?: number[];
  className?: string;
}

export default function DietCertificationBadges({ 
  certifications, 
  specializations = [],
  className = "" 
}: DietCertificationBadgesProps) {
  if ((!certifications || certifications.length === 0) && specializations.length === 0) {
    return null;
  }

  const getCertificationIcon = (cert: string): string => {
    const icons: Record<string, string> = {
      'vegetarian_certified': '🌱',
      'vegan_certified': '🌿',
      'gluten_free_certified': '✨',
      'organic_certified': '🌾',
      'healthy_certified': '💚',
    };
    return icons[cert] || '🏅';
  };

  const getCertificationName = (cert: string): string => {
    const names: Record<string, string> = {
      'vegetarian_certified': 'Vegetariano Certificado',
      'vegan_certified': 'Vegano Certificado',
      'gluten_free_certified': 'Sin Gluten Certificado',
      'organic_certified': 'Orgánico Certificado',
      'healthy_certified': 'Saludable Certificado',
    };
    return names[cert] || cert.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <TooltipProvider>
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {certifications.map((cert, index) => (
          <Tooltip key={index}>
            <TooltipTrigger>
              <Badge 
                variant="secondary" 
                className="text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                <span>{getCertificationIcon(cert)}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{getCertificationName(cert)}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {specializations.length > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                variant="outline" 
                className="text-xs border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                ⭐ Especialidad
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Restaurante especializado en estas opciones dietéticas</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
