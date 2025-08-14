import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Phone, Navigation, Globe, Mail } from 'lucide-react';
interface QuickActionTagsProps {
  phone?: string;
  website?: string;
  email?: string;
  address: string;
  latitude?: number;
  longitude?: number;
}
export default function QuickActionTags({
  phone,
  website,
  email,
  address,
  latitude,
  longitude
}: QuickActionTagsProps) {
  const handleNavigationClick = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
    } else {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`);
    }
  };
  return <div className="w-full overflow-hidden">
      <div className="flex gap-3 pb-0 overflow-x-auto scrollbar-hide">
        {phone && <Button size="sm" variant="outline" className="px-4 py-2 h-auto bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:scale-105 transition-all duration-300 flex items-center gap-2 flex-shrink-0" onClick={() => window.open(`tel:${phone}`)}>
            <Phone className="h-4 w-4 text-black" />
            <span className="text-black font-medium text-sm">Llamar</span>
          </Button>}
        
        <Button size="sm" variant="outline" className="px-4 py-2 h-auto bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:scale-105 transition-all duration-300 flex items-center gap-2 flex-shrink-0" onClick={handleNavigationClick}>
          <Navigation className="h-4 w-4 text-black" />
          <span className="text-black font-medium text-sm">Cómo llegar</span>
        </Button>

        {website && <Button size="sm" variant="outline" className="px-4 py-2 h-auto bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:scale-105 transition-all duration-300 flex items-center gap-2 flex-shrink-0" onClick={() => window.open(website, '_blank', 'noopener noreferrer')}>
            <Globe className="h-4 w-4 text-black" />
            <span className="text-black font-medium text-sm">Sitio web</span>
          </Button>}

        {email && <Button size="sm" variant="outline" className="px-4 py-2 h-auto bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:scale-105 transition-all duration-300 flex items-center gap-2 flex-shrink-0" onClick={() => window.open(`mailto:${email}`)}>
            <Mail className="h-4 w-4 text-black" />
            <span className="text-black font-medium text-sm">Email</span>
          </Button>}
      </div>
    </div>;
}