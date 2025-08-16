
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Navigation, 
  Globe, 
  Calendar, 
  Mail,
  Share2
} from 'lucide-react';

interface RestaurantActionButtonsProps {
  phone?: string;
  website?: string;
  email?: string;
  onShare?: () => void;
}

export default function RestaurantActionButtons({ 
  phone, 
  website, 
  email, 
  onShare 
}: RestaurantActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {phone && (
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 p-0 border-2 transition-all"
          asChild
        >
          <a href={`tel:${phone}`}>
            <Phone className="h-6 w-6" />
          </a>
        </Button>
      )}
      
      <Button
        size="lg"
        variant="outline"
        className="rounded-full w-16 h-16 p-0 border-2 transition-all"
        onClick={() => {
          // Implementar navegación con geolocalización
          console.log('Abrir direcciones');
        }}
      >
        <Navigation className="h-6 w-6" />
      </Button>

      {website && (
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 p-0 border-2 transition-all"
          asChild
        >
          <a href={website} target="_blank" rel="noopener noreferrer">
            <Globe className="h-6 w-6" />
          </a>
        </Button>
      )}

      <Button
        size="lg"
        variant="outline"
        className="rounded-full w-16 h-16 p-0 border-2 transition-all"
        onClick={() => {
          // Implementar reservas
          console.log('Hacer reserva');
        }}
      >
        <Calendar className="h-6 w-6" />
      </Button>

      {email && (
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 p-0 border-2 transition-all"
          asChild
        >
          <a href={`mailto:${email}`}>
            <Mail className="h-6 w-6" />
          </a>
        </Button>
      )}
    </div>
  );
}
