
import { Button } from '@/components/ui/button';
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
  onReservationClick?: () => void;
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
    <div className="flex flex-wrap gap-4 justify-start">
      {phone && (
        <Button
          size="lg"
          variant="outline"
          className="px-6 py-4 h-auto bg-white rounded-xl shadow-soft hover:shadow-card border-2 border-red-500 hover:scale-105 transition-all duration-300 flex items-center gap-3"
          onClick={() => window.open(`tel:${phone}`)}
        >
          <Phone className="h-5 w-5 text-red-600" />
          <span className="text-red-600 font-medium">Llamar</span>
        </Button>
      )}
      
      <Button
        size="lg"
        variant="outline"
        className="px-6 py-4 h-auto bg-white rounded-xl shadow-soft hover:shadow-card border-2 border-red-500 hover:scale-105 transition-all duration-300 flex items-center gap-3"
        onClick={handleNavigationClick}
      >
        <Navigation className="h-5 w-5 text-red-600" />
        <span className="text-red-600 font-medium">Cómo llegar</span>
      </Button>

      {website && (
        <Button
          size="lg"
          variant="outline"
          className="px-6 py-4 h-auto bg-white rounded-xl shadow-soft hover:shadow-card border-2 border-red-500 hover:scale-105 transition-all duration-300 flex items-center gap-3"
          onClick={() => window.open(website, '_blank', 'noopener noreferrer')}
        >
          <Globe className="h-5 w-5 text-red-600" />
          <span className="text-red-600 font-medium">Sitio web</span>
        </Button>
      )}

      {email && (
        <Button
          size="lg"
          variant="outline"
          className="px-6 py-4 h-auto bg-white rounded-xl shadow-soft hover:shadow-card border-2 border-red-500 hover:scale-105 transition-all duration-300 flex items-center gap-3"
          onClick={() => window.open(`mailto:${email}`)}
        >
          <Mail className="h-5 w-5 text-red-600" />
          <span className="text-red-600 font-medium">Email</span>
        </Button>
      )}

      {onReservationClick && (
        <Button
          size="lg"
          variant="outline"
          className="px-6 py-4 h-auto bg-white rounded-xl shadow-soft hover:shadow-card border-2 border-red-500 hover:scale-105 transition-all duration-300 flex items-center gap-3"
          onClick={onReservationClick}
        >
          <Calendar className="h-5 w-5 text-red-600" />
          <span className="text-red-600 font-medium">Reservas</span>
        </Button>
      )}
    </div>
  );
}
