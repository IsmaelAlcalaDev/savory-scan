
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
    <div className="flex flex-wrap gap-3 justify-center">
      {phone && (
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 p-0 border-2 hover:scale-110 transition-all hover:bg-green-50 hover:border-green-500"
          onClick={() => window.open(`tel:${phone}`)}
        >
          <Phone className="h-6 w-6 text-green-600" />
        </Button>
      )}
      
      <Button
        size="lg"
        variant="outline"
        className="rounded-full w-16 h-16 p-0 border-2 hover:scale-110 transition-all hover:bg-blue-50 hover:border-blue-500"
        onClick={handleNavigationClick}
      >
        <Navigation className="h-6 w-6 text-blue-600" />
      </Button>

      {website && (
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 p-0 border-2 hover:scale-110 transition-all hover:bg-purple-50 hover:border-purple-500"
          onClick={() => window.open(website, '_blank', 'noopener noreferrer')}
        >
          <Globe className="h-6 w-6 text-purple-600" />
        </Button>
      )}

      {email && (
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 p-0 border-2 hover:scale-110 transition-all hover:bg-orange-50 hover:border-orange-500"
          onClick={() => window.open(`mailto:${email}`)}
        >
          <Mail className="h-6 w-6 text-orange-600" />
        </Button>
      )}

      <Button
        size="lg"
        variant="outline"
        className="rounded-full w-16 h-16 p-0 border-2 hover:scale-110 transition-all hover:bg-primary/10 hover:border-primary"
        onClick={onReservationClick}
      >
        <Calendar className="h-6 w-6 text-primary" />
      </Button>
    </div>
  );
}
