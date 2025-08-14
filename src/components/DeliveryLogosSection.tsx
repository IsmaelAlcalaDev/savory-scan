
import { usePlatformConfigs } from '@/hooks/usePlatformConfigs';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="flex flex-wrap items-center justify-start gap-4">
        {availablePlatforms.map((platform) => {
          const url = deliveryLinks[platform.platform_key];
          
          return (
            <Button
              key={platform.id}
              size="lg"
              variant="outline"
              className="px-6 py-4 h-auto bg-white rounded-xl shadow-soft hover:shadow-card border-2 border-red-500 hover:scale-105 transition-all duration-300 flex items-center gap-3"
              onClick={() => window.open(url, '_blank', 'noopener noreferrer')}
            >
              {platform.icon ? (
                <img 
                  src={platform.icon}
                  alt={platform.platform_name}
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    console.error('Error loading logo for:', platform.platform_name);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Truck className="h-8 w-8 text-red-600" />
              )}
              <span className="text-red-600 font-medium">{platform.platform_name}</span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
