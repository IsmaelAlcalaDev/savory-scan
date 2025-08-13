
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
  glovo_url?: string;
  ubereats_url?: string;
  justeat_url?: string;
  deliveroo_url?: string;
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'glovo':
      return ShoppingBag;
    case 'ubereats':
      return Truck;
    case 'justeat':
      return Bike;
    case 'deliveroo':
      return Bike;
    default:
      return ExternalLink;
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'glovo':
      return 'hover:bg-yellow-500 hover:text-black';
    case 'ubereats':
      return 'hover:bg-green-600 hover:text-white';
    case 'justeat':
      return 'hover:bg-orange-500 hover:text-white';
    case 'deliveroo':
      return 'hover:bg-cyan-500 hover:text-white';
    default:
      return 'hover:bg-primary hover:text-primary-foreground';
  }
};

const getPlatformName = (platform: string) => {
  switch (platform) {
    case 'glovo':
      return 'Glovo';
    case 'ubereats':
      return 'Uber Eats';
    case 'justeat':
      return 'Just Eat';
    case 'deliveroo':
      return 'Deliveroo';
    default:
      return platform;
  }
};

export default function DeliveryPlatformsSection({ 
  glovo_url, 
  ubereats_url, 
  justeat_url, 
  deliveroo_url 
}: DeliveryPlatformsSectionProps) {
  const platforms = [
    { key: 'glovo', url: glovo_url, name: 'Glovo' },
    { key: 'ubereats', url: ubereats_url, name: 'Uber Eats' },
    { key: 'justeat', url: justeat_url, name: 'Just Eat' },
    { key: 'deliveroo', url: deliveroo_url, name: 'Deliveroo' }
  ].filter(platform => platform.url);

  if (platforms.length === 0) {
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
        {platforms.map(({ key, url, name }) => {
          const Icon = getPlatformIcon(key);
          const colorClass = getPlatformColor(key);
          
          return (
            <Button
              key={key}
              variant="outline"
              className={`p-4 h-auto justify-between transition-all duration-200 ${colorClass}`}
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
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
