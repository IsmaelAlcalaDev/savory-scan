
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight } from 'lucide-react';
import { useRestaurantEvents } from '@/hooks/useRestaurantEvents';
import RestaurantEventCard from './RestaurantEventCard';

interface RestaurantEventsSectionProps {
  restaurantId: number;
}

export default function RestaurantEventsSection({ restaurantId }: RestaurantEventsSectionProps) {
  const { events, loading, error } = useRestaurantEvents(restaurantId);
  const [showAll, setShowAll] = useState(false);

  if (loading) return null;
  if (error || !events || events.length === 0) return null;

  const eventsToShow = showAll ? events : events.slice(0, 2);
  const hasMoreEvents = events.length > 2;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Próximos eventos
        </h3>
        {hasMoreEvents && !showAll && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAll(true)}
            className="text-primary hover:text-primary/80"
          >
            Ver todos
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eventsToShow.map((event) => (
          <RestaurantEventCard key={event.id} event={event} />
        ))}
      </div>

      {showAll && hasMoreEvents && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(false)}
            className="mt-2"
          >
            Ver menos
          </Button>
        </div>
      )}
    </div>
  );
}
