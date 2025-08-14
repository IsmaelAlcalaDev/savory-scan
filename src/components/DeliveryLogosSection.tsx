
import { usePlatformConfigs } from '@/hooks/usePlatformConfigs';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeliveryLogosSectionProps {
  deliveryLinks?: Record<string, string>;
}

const getPlatformStyles = (platformKey: string) => {
  switch (platformKey.toLowerCase()) {
    case 'glovo':
      return {
        bg: 'bg-yellow-400 hover:bg-yellow-500',
        text: 'text-black'
      };
    case 'ubereats':
    case 'uber-eats':
      return {
        bg: 'bg-black hover:bg-gray-800',
        text: 'text-white'
      };
    case 'justeat':
    case 'just-eat':
      return {
        bg: 'bg-orange-500 hover:bg-orange-600',
        text: 'text-white'
      };
    case 'deliveroo':
      return {
        bg: 'bg-cyan-400 hover:bg-cyan-500',
        text: 'text-white'
      };
    default:
      return {
        bg: 'bg-primary hover:bg-primary/90',
        text: 'text-primary-foreground'
      };
  }
};

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
          const styles = getPlatformStyles(platform.platform_key);
          
          return (
            <Button
              key={platform.id}
              size="lg"
              className={`px-6 py-4 h-auto rounded-xl shadow-soft hover:shadow-card hover:scale-105 transition-all duration-300 border-0 ${styles.bg} ${styles.text}`}
              onClick={() => window.open(url, '_blank', 'noopener noreferrer')}
            >
              <span className="font-medium">{platform.platform_name}</span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
