
import React from 'react';
import { usePlatformConfigs } from '@/hooks/usePlatformConfigs';

interface RestaurantSocialSectionProps {
  socialLinks: Record<string, string>;
}

export default function RestaurantSocialSection({ socialLinks }: RestaurantSocialSectionProps) {
  const { data: platforms, isLoading } = usePlatformConfigs('social');

  if (isLoading || !platforms?.length) {
    return null;
  }

  // Filtrar solo las plataformas que tienen enlaces
  const availablePlatforms = platforms.filter(
    platform => socialLinks[platform.platform_key] && socialLinks[platform.platform_key].trim().length > 0
  );

  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">Síguenos en redes sociales</h3>
      <div className="flex flex-wrap items-center justify-start gap-4">
        {availablePlatforms.map((platform) => {
          const url = socialLinks[platform.platform_key];
          
          return (
            <a
              key={platform.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 hover:opacity-80 transition-opacity duration-200 hover:scale-105 transform"
              title={`Síguenos en ${platform.platform_name}`}
            >
              {platform.icon ? (
                <img 
                  src={platform.icon}
                  alt={platform.platform_name}
                  className="h-12 w-12 object-contain rounded-lg"
                  onError={(e) => {
                    console.error('Error loading logo for:', platform.platform_name);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <div 
                    className="h-6 w-6 rounded-full"
                    style={{ backgroundColor: platform.icon_color || '#6B7280' }}
                  />
                </div>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
