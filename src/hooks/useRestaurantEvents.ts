
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
    if (!restaurantId) {
      console.log('No restaurant ID provided');
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching events for restaurant ID:', restaurantId);

        // First check if there are any events in the table at all
        console.log('Checking total events in database...');
        const { data: allEvents, error: countError } = await supabase
          .from('events')
          .select('id, restaurant_id, name, event_date, is_active, deleted_at')
          .limit(5);

        console.log('Total events sample from DB:', allEvents);
        console.log('Count query error:', countError);

        // Now check events for this specific restaurant
        console.log('Checking events for restaurant', restaurantId);
        const { data: restaurantEvents, error: restaurantError } = await supabase
          .from('events')
          .select('id, restaurant_id, name, event_date, is_active, deleted_at')
          .eq('restaurant_id', restaurantId);

        console.log('Events for this restaurant (all):', restaurantEvents);
        console.log('Restaurant events query error:', restaurantError);

        // Check what today's date looks like
        const today = new Date().toISOString().split('T')[0];
        console.log('Today date for comparison:', today);

        // Get all events for this restaurant
        const { data, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .gte('event_date', today)
          .order('event_date', { ascending: true })
          .order('start_time', { ascending: true });

        console.log('Final events query result:', data);
        console.log('Final events query error:', eventsError);

        if (eventsError) {
          console.error('Supabase error:', eventsError);
          throw eventsError;
        }

        if (!data || data.length === 0) {
          console.log('No events found for restaurant', restaurantId, 'after date filter');
          setEvents([]);
          return;
        }

        // Transform the data to match our interface
        const transformedEvents = data.map(event => {
          console.log('Processing event:', event);
          
          let parsedTags: string[] = [];
          if (event.tags) {
            try {
              if (typeof event.tags === 'string') {
                parsedTags = JSON.parse(event.tags);
              } else if (Array.isArray(event.tags)) {
                parsedTags = event.tags.filter(tag => typeof tag === 'string');
              }
            } catch (e) {
              console.warn('Error parsing tags for event', event.id, e);
              parsedTags = [];
            }
          }

          return {
            ...event,
            tags: parsedTags
          };
        });

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

  console.log('Hook state - loading:', loading, 'events count:', events.length, 'error:', error);
  
  return { events, loading, error };
};
