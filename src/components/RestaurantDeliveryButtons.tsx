
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Truck,
  ShoppingBag,
  Bike,
  ExternalLink
} from 'lucide-react';

interface RestaurantDeliveryButtonsProps {
  deliveryLinks: Record<string, string>;
}

const getDeliveryIcon = (platform: string) => {
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

const getDeliveryStyles = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'glovo':
      return {
        bg: 'bg-yellow-500 hover:bg-yellow-600',
        text: 'text-black',
        name: 'Glovo'
      };
    case 'ubereats':
      return {
        bg: 'bg-green-600 hover:bg-green-700',
        text: 'text-white',
        name: 'Uber Eats'
      };
    case 'justeat':
    case 'just-eat':
      return {
        bg: 'bg-orange-500 hover:bg-orange-600',
        text: 'text-white',
        name: 'Just Eat'
      };
    case 'deliveroo':
      return {
        bg: 'bg-cyan-500 hover:bg-cyan-600',
        text: 'text-white',
        name: 'Deliveroo'
      };
    default:
      return {
        bg: 'bg-primary hover:bg-primary/90',
        text: 'text-primary-foreground',
        name: platform.charAt(0).toUpperCase() + platform.slice(1)
      };
  }
};

export default function RestaurantDeliveryButtons({ deliveryLinks }: RestaurantDeliveryButtonsProps) {
  // Filter valid delivery links
  const validDeliveryLinks = Object.entries(deliveryLinks).filter(([platform, url]) => {
    return url && typeof url === 'string' && url.trim().length > 0;
  });

  if (validDeliveryLinks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground text-center">Pedir a domicilio</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {validDeliveryLinks.map(([platform, url]) => {
          const Icon = getDeliveryIcon(platform);
          const styles = getDeliveryStyles(platform);
          
          return (
            <Button
              key={platform}
              size="sm"
              className={`${styles.bg} ${styles.text} hover:scale-105 transition-all duration-200 px-3 py-2 gap-2`}
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Icon className="h-4 w-4" />
                {styles.name}
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
