
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Navigation, 
  Globe, 
  Calendar, 
  Mail
} from 'lucide-react';

interface QuickActionTagsProps {
  phone?: string;
  website?: string;
  email?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  onReservationClick: () => void;
}

export default function QuickActionTags({ 
  phone, 
  website, 
  email, 
  address,
  latitude,
  longitude,
  onReservationClick
}: QuickActionTagsProps) {
  const handleNavigationClick = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
    } else {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {phone && (
        <Badge 
          variant="outline" 
          className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1"
          onClick={() => window.open(`tel:${phone}`)}
        >
          <Phone className="h-3 w-3 mr-1" />
          Llamar
        </Badge>
      )}
      
      <Badge 
        variant="outline" 
        className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1"
        onClick={handleNavigationClick}
      >
        <Navigation className="h-3 w-3 mr-1" />
        Cómo llegar
      </Badge>

      {website && (
        <Badge 
          variant="outline" 
          className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1"
          onClick={() => window.open(website, '_blank', 'noopener noreferrer')}
        >
          <Globe className="h-3 w-3 mr-1" />
          Sitio web
        </Badge>
      )}

      {email && (
        <Badge 
          variant="outline" 
          className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1"
          onClick={() => window.open(`mailto:${email}`)}
        >
          <Mail className="h-3 w-3 mr-1" />
          Email
        </Badge>
      )}

      <Badge 
        variant="outline" 
        className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1"
        onClick={onReservationClick}
      >
        <Calendar className="h-3 w-3 mr-1" />
        Reservas
      </Badge>
    </div>
  );
}
