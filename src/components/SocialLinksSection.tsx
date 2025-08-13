
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  ExternalLink, 
  Youtube,
  Music
} from 'lucide-react';

interface SocialLinksSectionProps {
  socialLinks?: any;
  socialProfiles?: any;
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
      return 'hover:bg-blue-600 hover:text-white';
    case 'instagram':
      return 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white';
    case 'twitter':
      return 'hover:bg-blue-400 hover:text-white';
    case 'youtube':
      return 'hover:bg-red-600 hover:text-white';
    case 'tiktok':
      return 'hover:bg-black hover:text-white';
    default:
      return 'hover:bg-primary hover:text-primary-foreground';
  }
};

export default function SocialLinksSection({ socialLinks, socialProfiles }: SocialLinksSectionProps) {
  if (!socialLinks || Object.keys(socialLinks).length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Redes Sociales</h3>
      <div className="space-y-3">
        {Object.entries(socialLinks).map(([platform, url]) => {
          const Icon = getSocialIcon(platform);
          const profile = socialProfiles?.[platform] || '';
          const colorClass = getSocialColor(platform);
          
          return (
            <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <div>
                  <p className="font-medium capitalize">{platform}</p>
                  {profile && (
                    <p className="text-sm text-muted-foreground">{profile}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className={`transition-all duration-200 ${colorClass}`}
                asChild
              >
                <a href={url as string} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visitar
                </a>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
