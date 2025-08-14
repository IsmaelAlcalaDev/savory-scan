
import { usePlatformConfigs } from '@/hooks/usePlatformConfigs';
import { Truck } from 'lucide-react';

interface DeliveryLogosSectionProps {
  deliveryLinks?: Record<string, string>;
}

export default function DeliveryLogosSection({ deliveryLinks = {} }: DeliveryLogosSectionProps) {
  const { data: platforms, isLoading } = usePlatformConfigs('delivery');

  if (isLoading || !platforms?.length) {
    return null;
  }

  // Filtrar solo las plataformas que tienen enlaces de delivery
  const availablePlatforms = platforms.filter(
    platform => deliveryLinks[platform.platform_key] && deliveryLinks[platform.platform_key].trim().length > 0
  );

  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Truck className="h-4 w-4 text-primary" />
        Delivery
      </h3>
      <div className="flex flex-wrap items-center justify-start gap-6">
        {availablePlatforms.map((platform) => {
          const url = deliveryLinks[platform.platform_key];
          
          return (
            <a
              key={platform.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 hover:opacity-80 transition-opacity duration-200 hover:scale-105 transform"
              title={`Pedir en ${platform.platform_name}`}
            >
              {platform.icon ? (
                <img 
                  src={platform.icon}
                  alt={platform.platform_name}
                  className="h-16 w-16 object-contain rounded-lg"
                  onError={(e) => {
                    console.error('Error loading logo for:', platform.platform_name);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                  <Truck className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
