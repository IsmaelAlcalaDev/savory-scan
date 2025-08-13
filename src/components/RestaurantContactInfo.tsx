
import React from 'react';
import { Phone, MapPin, Mail } from 'lucide-react';

interface RestaurantContactInfoProps {
  phone?: string;
  email?: string;
  address: string;
  schedules: Array<{
    day_of_week: number;
    opening_time: string;
    closing_time: string;
    is_closed: boolean;
  }>;
}

export default function RestaurantContactInfo({ 
  phone, 
  email, 
  address 
}: RestaurantContactInfoProps) {
  return (
    <div className="space-y-6 bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        Información de contacto
      </h3>
      
      <div className="space-y-4">
        {phone && (
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-0.5">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <a 
                href={`tel:${phone}`} 
                className="font-medium text-lg hover:text-primary transition-colors"
              >
                {phone}
              </a>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="bg-primary/10 rounded-full p-2 mt-0.5">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dirección</p>
            <p className="font-medium">{address}</p>
          </div>
        </div>

        {email && (
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-0.5">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <a 
                href={`mailto:${email}`} 
                className="font-medium hover:text-primary transition-colors"
              >
                {email}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
