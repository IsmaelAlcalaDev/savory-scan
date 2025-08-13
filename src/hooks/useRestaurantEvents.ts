
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RestaurantEvent {
  id: number;
  name: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  entry_price?: number;
  is_free: boolean;
  image_url?: string;
  category: string;
  requires_reservation: boolean;
  available_seats?: number;
  contact_for_reservations?: string;
  age_restriction: string;
  dress_code: string;
  tags: string[];
}

export const useRestaurantEvents = (restaurantId: number) => {
  const [events, setEvents] = useState<RestaurantEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching events for restaurant ID:', restaurantId);

        // Simplified query to get all events for this restaurant
        const { data, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .gte('event_date', new Date().toISOString().split('T')[0]) // Only future events
          .order('event_date', { ascending: true })
          .order('start_time', { ascending: true });

        console.log('Events query result:', data);
        console.log('Events query error:', eventsError);

        if (eventsError) {
          throw eventsError;
        }

        // Transform the data to match our interface
        const transformedEvents = (data || []).map(event => ({
          ...event,
          tags: Array.isArray(event.tags) 
            ? event.tags.filter(tag => typeof tag === 'string') as string[]
            : []
        }));

        console.log('Transformed events:', transformedEvents);
        setEvents(transformedEvents);
      } catch (err) {
        console.error('Error fetching restaurant events:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [restaurantId]);

  return { events, loading, error };
};
