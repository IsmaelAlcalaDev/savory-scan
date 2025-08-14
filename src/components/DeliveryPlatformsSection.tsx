
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink,
  Truck,
  ShoppingBag,
  Bike
} from 'lucide-react';

interface DeliveryPlatformsSectionProps {
  deliveryLinks?: any;
}

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'glovo':
      return ShoppingBag;
    case 'ubereats':
      return Truck;
    case 'justeat':
    case 'just-eat':
      return Bike;
    case 'deliveroo':
      return Bike;
    default:
      return ExternalLink;
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'glovo':
      return 'hover:bg-yellow-500 hover:text-black';
    case 'ubereats':
      return 'hover:bg-green-600 hover:text-white';
    case 'justeat':
    case 'just-eat':
      return 'hover:bg-orange-500 hover:text-white';
    case 'deliveroo':
      return 'hover:bg-cyan-500 hover:text-white';
    default:
      return 'hover:bg-primary hover:text-primary-foreground';
  }
};

const getPlatformName = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'glovo':
      return 'Glovo';
    case 'ubereats':
      return 'Uber Eats';
    case 'justeat':
    case 'just-eat':
      return 'Just Eat';
    case 'deliveroo':
      return 'Deliveroo';
    default:
      return platform.charAt(0).toUpperCase() + platform.slice(1);
  }
};

export default function DeliveryPlatformsSection({ deliveryLinks }: DeliveryPlatformsSectionProps) {
  console.log('DeliveryPlatformsSection received deliveryLinks:', deliveryLinks);
  console.log('DeliveryLinks type:', typeof deliveryLinks);
  console.log('DeliveryLinks keys:', deliveryLinks ? Object.keys(deliveryLinks) : 'No deliveryLinks');

  if (!deliveryLinks || typeof deliveryLinks !== 'object') {
    console.log('No delivery links object provided');
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Plataformas de Delivery
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No disponible para delivery</p>
        </div>
      </div>
    );
  }

  const validDeliveryLinks = Object.entries(deliveryLinks).filter(([platform, url]) => {
    return url && typeof url === 'string' && url.trim().length > 0;
  });

  console.log('Valid delivery links:', validDeliveryLinks);

  if (validDeliveryLinks.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Plataformas de Delivery
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No disponible para delivery</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Truck className="h-5 w-5 text-primary" />
        Plataformas de Delivery
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {validDeliveryLinks.map(([platform, url]) => {
          const Icon = getPlatformIcon(platform);
          const colorClass = getPlatformColor(platform);
          const name = getPlatformName(platform);
          
          return (
            <Button
              key={platform}
              variant="outline"
              className={`p-4 h-auto justify-between transition-all duration-200 ${colorClass}`}
              asChild
            >
              <a href={url as string} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{name}</span>
                </div>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
