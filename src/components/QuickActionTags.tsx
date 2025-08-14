
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

  const actions = [
    ...(phone ? [{
      icon: Phone,
      label: 'Llamar',
      action: () => window.open(`tel:${phone}`)
    }] : []),
    {
      icon: Navigation,
      label: 'Cómo llegar',
      action: handleNavigationClick
    },
    ...(website ? [{
      icon: Globe,
      label: 'Sitio web',
      action: () => window.open(website, '_blank', 'noopener noreferrer')
    }] : []),
    ...(email ? [{
      icon: Mail,
      label: 'Email',
      action: () => window.open(`mailto:${email}`)
    }] : []),
    ...(onReservationClick ? [{
      icon: Calendar,
      label: 'Reservas',
      action: onReservationClick
    }] : [])
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            size="lg"
            variant="outline"
            className="w-full h-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-white rounded-xl shadow-soft hover:shadow-card border-2 border-red-500 hover:scale-105 transition-all duration-300 flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
            onClick={action.action}
          >
            <Icon className="h-5 w-5 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
            <span className="text-red-600 font-medium text-xs sm:text-sm text-center sm:text-left">
              {action.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
