
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink } from 'lucide-react';

export default function BookingPlatformsSection() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        Reservas Online
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="p-4 h-auto justify-between hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          asChild
        >
          <a href="#" target="_blank" rel="noopener noreferrer">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">TheFork</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        
        <Button
          variant="outline"
          className="p-4 h-auto justify-between hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          asChild
        >
          <a href="#" target="_blank" rel="noopener noreferrer">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">OpenTable</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
