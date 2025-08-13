
import React from 'react';
import { Button } from '@/components/ui/button';
import { usePlatformConfigs } from '@/hooks/usePlatformConfigs';
import { 
  Facebook,
  Instagram, 
  Twitter,
  Music,
  Youtube,
  Truck,
  Utensils,
  ChefHat,
  Bike,
  Calendar,
  CalendarCheck,
  Clock,
  Star,
  MapPin,
  ExternalLink
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Facebook,
  Instagram,
  Twitter,
  Music,
  Youtube,
  Truck,
  Utensils,
  ChefHat,
  Bike,
  Calendar,
  CalendarCheck,
  Clock,
  Star,
  MapPin,
  ExternalLink
};

interface RestaurantPlatformsProps {
  category: 'social' | 'delivery' | 'booking' | 'review';
  title: string;
  restaurantLinks?: Record<string, string>;
}

export default function RestaurantPlatforms({ 
  category, 
  title, 
  restaurantLinks = {} 
}: RestaurantPlatformsProps) {
  const { data: platforms, loading } = usePlatformConfigs(category);

  if (loading || !platforms?.length) {
    return null;
  }

  // Filtrar solo las plataformas que tienen enlaces
  const availablePlatforms = platforms.filter(
    platform => restaurantLinks[platform.platform_key]
  );

  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {availablePlatforms.map((platform) => {
          const IconComponent = iconMap[platform.icon_name] || ExternalLink;
          const url = restaurantLinks[platform.platform_key];
          
          return (
            <Button
              key={platform.id}
              variant="outline"
              size="sm"
              className="rounded-full px-4 py-2 h-10 gap-2 hover:scale-105 transition-all border-2"
              style={{
                borderColor: platform.icon_color || 'currentColor',
                '--tw-text-opacity': '1'
              }}
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <IconComponent 
                  className="h-4 w-4" 
                  style={{ color: platform.icon_color || 'currentColor' }}
                />
                {platform.platform_name}
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
