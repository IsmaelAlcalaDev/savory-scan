
import React from 'react';
import { usePlatformConfigs } from '@/hooks/usePlatformConfigs';

interface SocialLinksSectionProps {
  socialLinks?: any;
}

export default function SocialLinksSection({ socialLinks }: SocialLinksSectionProps) {
  const { data: platforms, isLoading } = usePlatformConfigs('social');

  if (isLoading || !platforms?.length) {
    return null;
  }

  if (!socialLinks || typeof socialLinks !== 'object' || Object.keys(socialLinks).length === 0) {
    return null;
  }

  const validSocialLinks = Object.entries(socialLinks).filter(([platform, url]) => {
    return url && typeof url === 'string' && url.trim().length > 0;
  });

  // Filtrar solo las plataformas que tienen enlaces y están configuradas
  const availablePlatforms = platforms.filter(
    platform => validSocialLinks.some(([key]) => key === platform.platform_key)
  );

  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">Redes Sociales</h3>
      <div className="flex flex-wrap items-center justify-start gap-6">
        {availablePlatforms.map((platform) => {
          const url = socialLinks[platform.platform_key];
          
          return (
            <a
              key={platform.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 hover:opacity-80 transition-opacity duration-200 hover:scale-105 transform"
              title={`Visitar ${platform.platform_name}`}
            >
              {platform.icon ? (
                <img 
                  src={platform.icon}
                  alt={platform.platform_name}
                  className="h-16 w-16 object-contain rounded-lg"
                  onError={(e) => {
                    console.error('Error loading logo for:', platform.platform_name);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                  <div 
                    className="h-8 w-8 rounded-full"
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
