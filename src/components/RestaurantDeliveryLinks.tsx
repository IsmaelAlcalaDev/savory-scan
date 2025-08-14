
import { Button } from '@/components/ui/button';
import { Truck, ExternalLink } from 'lucide-react';

interface RestaurantDeliveryLinksProps {
  deliveryLinks?: Record<string, string>;
}

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

export default function RestaurantDeliveryLinks({ deliveryLinks = {} }: RestaurantDeliveryLinksProps) {
  const availableLinks = Object.entries(deliveryLinks).filter(
    ([platform, url]) => url && url.trim().length > 0
  );

  if (availableLinks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Truck className="h-4 w-4 text-primary" />
        Delivery
      </h3>
      <div className="space-y-2">
        {availableLinks.map(([platform, url]) => (
          <Button
            key={platform}
            variant="outline"
            className="w-full justify-between p-3 h-auto hover:scale-[1.02] transition-all duration-200"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <span className="font-medium">{getPlatformName(platform)}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ))}
      </div>
    </section>
  );
}
