
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ChevronRight, Users, MapPin } from 'lucide-react';
import { useRestaurantEvents } from '@/hooks/useRestaurantEvents';

interface CompactRestaurantEventsProps {
  restaurantId: number;
}

export default function CompactRestaurantEvents({ restaurantId }: CompactRestaurantEventsProps) {
  const { events, loading, error } = useRestaurantEvents(restaurantId);
  const [showAll, setShowAll] = useState(false);

  console.log('CompactRestaurantEvents render:', { restaurantId, loading, eventsCount: events?.length, error });

  if (loading) {
    console.log('Events still loading...');
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">Cargando eventos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Events error:', error);
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">Error al cargar eventos</span>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    console.log('No events found, not rendering component');
    return null;
  }

  const eventsToShow = showAll ? events : events.slice(0, 2);
  const hasMoreEvents = events.length > 2;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  console.log('Rendering events component with', eventsToShow.length, 'events');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Próximos eventos
        </h3>
        {hasMoreEvents && !showAll && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAll(true)}
            className="text-primary hover:text-primary/80 h-auto p-1"
          >
            Ver todos
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {eventsToShow.map((event) => (
          <div 
            key={event.id} 
            className="bg-primary/5 rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-base line-clamp-1 text-foreground">
                    {event.name}
                  </h4>
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 ml-2 flex-shrink-0">
                    {event.category}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {event.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">{formatDate(event.event_date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      {formatTime(event.start_time)}
                      {event.end_time && ` - ${formatTime(event.end_time)}`}
                    </span>
                  </div>

                  {event.available_seats && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.available_seats} plazas</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {event.is_free ? (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                        Gratis
                      </Badge>
                    ) : event.entry_price && (
                      <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                        {event.entry_price}€
                      </Badge>
                    )}

                    {event.requires_reservation && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
                        Reserva requerida
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAll && hasMoreEvents && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAll(false)}
          className="w-full mt-2"
        >
          Ver menos
        </Button>
      )}
    </div>
  );
}
