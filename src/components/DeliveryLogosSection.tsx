
import { usePlatformConfigs } from '@/hooks/usePlatformConfigs';
import { Truck } from 'lucide-react';

interface DeliveryLogosSectionProps {
  deliveryLinks?: Record<string, string>;
}

export default function DeliveryLogosSection({ deliveryLinks = {} }: DeliveryLogosSectionProps) {
  const { data: platforms, isLoading } = usePlatformConfigs('delivery');

  console.log('DeliveryLogosSection - platforms:', platforms);
  console.log('DeliveryLogosSection - deliveryLinks:', deliveryLinks);
  console.log('DeliveryLogosSection - isLoading:', isLoading);

  if (isLoading || !platforms?.length) {
    console.log('DeliveryLogosSection - returning null due to loading or no platforms');
    return null;
  }

  // Filtrar solo las plataformas que tienen enlaces de delivery
  const availablePlatforms = platforms.filter(
    platform => deliveryLinks[platform.platform_key] && deliveryLinks[platform.platform_key].trim().length > 0
  );

  console.log('DeliveryLogosSection - availablePlatforms:', availablePlatforms);

  if (availablePlatforms.length === 0) {
    console.log('DeliveryLogosSection - no available platforms, returning null');
    return null;
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Truck className="h-4 w-4 text-primary" />
        Delivery
      </h3>
      <div className="flex items-center gap-4">
        {availablePlatforms.map((platform) => {
          const url = deliveryLinks[platform.platform_key];
          
          console.log('DeliveryLogosSection - platform:', platform);
          console.log('DeliveryLogosSection - platform icon:', platform.icon);
          console.log('DeliveryLogosSection - url:', url);
          
          return (
            <a
              key={platform.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
              title={`Pedir en ${platform.platform_name}`}
            >
              {platform.icon ? (
                <img 
                  src={platform.icon}
                  alt={platform.platform_name}
                  className="h-12 w-12 object-contain"
                  onError={(e) => {
                    console.error('DeliveryLogosSection - Image load error for:', platform.platform_name, platform.icon);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('DeliveryLogosSection - Image loaded successfully for:', platform.platform_name);
                  }}
                />
              ) : (
                <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                  <Truck className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
