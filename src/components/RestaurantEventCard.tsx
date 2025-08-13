
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Euro, MapPin } from 'lucide-react';
import { RestaurantEvent } from '@/hooks/useRestaurantEvents';

interface RestaurantEventCardProps {
  event: RestaurantEvent;
}

export default function RestaurantEventCard({ event }: RestaurantEventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const getAgeRestrictionText = (restriction: string) => {
    switch (restriction) {
      case 'all_ages': return 'Todas las edades';
      case 'adults_only': return 'Solo adultos';
      case 'over_18': return '+18';
      case 'over_21': return '+21';
      default: return restriction;
    }
  };

  const getDressCodeText = (code: string) => {
    switch (code) {
      case 'casual': return 'Casual';
      case 'smart_casual': return 'Smart Casual';
      case 'formal': return 'Formal';
      case 'cocktail': return 'Cocktail';
      default: return code;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border/20 overflow-hidden hover:shadow-lg transition-all duration-300">
      {event.image_url && (
        <div className="h-32 overflow-hidden">
          <img 
            src={event.image_url} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {event.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {event.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {event.category}
          </Badge>
          {event.is_free ? (
            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
              Gratis
            </Badge>
          ) : event.entry_price && (
            <Badge variant="outline" className="text-xs">
              {event.entry_price}€
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(event.event_date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>
              {formatTime(event.start_time)}
              {event.end_time && ` - ${formatTime(event.end_time)}`}
            </span>
          </div>

          {event.available_seats && (
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>{event.available_seats} plazas disponibles</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs">
            <span>{getAgeRestrictionText(event.age_restriction)}</span>
            <span>{getDressCodeText(event.dress_code)}</span>
          </div>
        </div>

        {event.requires_reservation && (
          <div className="pt-2 border-t border-border/20">
            <p className="text-xs text-amber-600 font-medium">
              Requiere reserva
              {event.contact_for_reservations && (
                <span className="block text-muted-foreground font-normal">
                  {event.contact_for_reservations}
                </span>
              )}
            </p>
          </div>
        )}

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
