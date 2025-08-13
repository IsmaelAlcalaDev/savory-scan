
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink } from 'lucide-react';

interface BookingPlatformsSectionProps {
  thefork_url?: string;
  bookingPlatforms?: any;
}

export default function BookingPlatformsSection({ thefork_url, bookingPlatforms }: BookingPlatformsSectionProps) {
  const platforms = [];
  
  if (thefork_url) {
    platforms.push({ name: 'TheFork', url: thefork_url });
  }
  
  if (bookingPlatforms && Object.keys(bookingPlatforms).length > 0) {
    Object.entries(bookingPlatforms).forEach(([key, url]) => {
      const name = key === 'opentable' ? 'OpenTable' : 
                   key === 'resy' ? 'Resy' : 
                   key === 'bookatable' ? 'Bookatable' : key;
      platforms.push({ name, url: url as string });
    });
  }

  if (platforms.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Reservas Online
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Llama para hacer tu reserva</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        Reservas Online
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {platforms.map(({ name, url }) => (
          <Button
            key={name}
            variant="outline"
            className="p-4 h-auto justify-between hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">{name}</span>
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
