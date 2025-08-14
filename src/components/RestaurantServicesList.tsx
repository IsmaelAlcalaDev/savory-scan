import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface RestaurantServicesListProps {
  services: string[];
}

export default function RestaurantServicesList({ services }: RestaurantServicesListProps) {
  const isMobile = useIsMobile();

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-primary" />
        Servicios disponibles
      </h3>
      
      {isMobile ? (
        // Mobile: Show as tags
        <div className="flex flex-wrap gap-2">
          {services.map((service, index) => (
            <Badge key={index} variant="secondary" className="text-sm">
              {service}
            </Badge>
          ))}
        </div>
      ) : (
        // Desktop: Keep existing card design
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
            >
              <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">{service}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
