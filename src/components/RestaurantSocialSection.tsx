
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  ExternalLink, 
  Youtube,
  Music
} from 'lucide-react';

interface RestaurantSocialSectionProps {
  socialLinks: Record<string, string>;
}

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return Facebook;
    case 'instagram':
      return Instagram;
    case 'twitter':
      return Twitter;
    case 'youtube':
      return Youtube;
    case 'tiktok':
      return Music;
    default:
      return ExternalLink;
  }
};

const getSocialColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return 'hover:bg-blue-600 hover:text-white border-blue-600 text-blue-600';
    case 'instagram':
      return 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white border-pink-500 text-pink-500';
    case 'twitter':
      return 'hover:bg-blue-400 hover:text-white border-blue-400 text-blue-400';
    case 'youtube':
      return 'hover:bg-red-600 hover:text-white border-red-600 text-red-600';
    case 'tiktok':
      return 'hover:bg-black hover:text-white border-black text-black';
    default:
      return 'hover:bg-primary hover:text-primary-foreground border-primary text-primary';
  }
};

const getSocialName = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    case 'twitter':
      return 'Twitter';
    case 'youtube':
      return 'YouTube';
    case 'tiktok':
      return 'TikTok';
    default:
      return platform.charAt(0).toUpperCase() + platform.slice(1);
  }
};

export default function RestaurantSocialSection({ socialLinks }: RestaurantSocialSectionProps) {
  // Filter valid social links
  const validSocialLinks = Object.entries(socialLinks).filter(([platform, url]) => {
    return url && typeof url === 'string' && url.trim().length > 0;
  });

  if (validSocialLinks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Síguenos en redes sociales</h3>
      <div className="flex flex-wrap gap-3">
        {validSocialLinks.map(([platform, url]) => {
          const Icon = getSocialIcon(platform);
          const colorClass = getSocialColor(platform);
          const name = getSocialName(platform);
          
          return (
            <Button
              key={platform}
              variant="outline"
              size="sm"
              className={`rounded-full px-4 py-2 h-10 gap-2 hover:scale-105 transition-all border-2 ${colorClass}`}
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Icon className="h-4 w-4" />
                {name}
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
