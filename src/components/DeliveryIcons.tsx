
import { usePlatformConfigs } from '@/hooks/usePlatformConfigs';
import { 
  Truck,
  Utensils,
  ChefHat,
  Bike,
  ExternalLink
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Truck,
  Utensils,
  ChefHat,
  Bike,
  ExternalLink
};

interface DeliveryIconsProps {
  restaurantLinks?: Record<string, string>;
}

export default function DeliveryIcons({ restaurantLinks = {} }: DeliveryIconsProps) {
  const { data: platforms, isLoading } = usePlatformConfigs('delivery');

  if (isLoading || !platforms?.length) {
    return null;
  }

  const availablePlatforms = platforms.filter(
    platform => restaurantLinks[platform.platform_key]
  );

  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {availablePlatforms.map((platform) => {
        const IconComponent = iconMap[platform.icon_name] || ExternalLink;
        const url = restaurantLinks[platform.platform_key];
        
        return (
          <button
            key={platform.id}
            onClick={() => window.open(url, '_blank', 'noopener noreferrer')}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-all flex items-center justify-center"
            title={`Pedir en ${platform.platform_name}`}
          >
            <IconComponent 
              className="h-5 w-5 text-white" 
              style={{ color: platform.icon_color || 'white' }}
            />
          </button>
        );
      })}
    </div>
  );
}
