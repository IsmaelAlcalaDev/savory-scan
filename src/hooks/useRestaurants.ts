
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
  google_rating_count?: number;
  distance_km?: number;
  cuisine_types: string[];
  establishment_type?: string;
  services: string[];
  favorites_count: number;
  cover_image_url?: string;
  logo_url?: string;
}

type PriceRange = '€' | '€€' | '€€€' | '€€€€';

interface UseRestaurantsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: PriceRange[];
  minRating?: number;
}

const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const useRestaurants = ({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 50,
  cuisineTypeIds,
  priceRanges,
  minRating = 0
}: UseRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching restaurants with params:', {
          searchQuery,
          userLat,
          userLng,
          maxDistance,
          cuisineTypeIds,
          priceRanges,
          minRating
        });

        let query = supabase
          .from('restaurants')
          .select(`
            id,
            name,
            slug,
            description,
            price_range,
            google_rating,
            google_rating_count,
            latitude,
            longitude,
            favorites_count,
            cover_image_url,
            logo_url,
            establishment_types!inner(name),
            restaurant_cuisines!inner(
              cuisine_types!inner(name, id)
            ),
            restaurant_services(
              services!inner(name)
            )
          `)
          .eq('is_active', true)
          .eq('is_published', true)
          .is('deleted_at', null);

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        if (minRating > 0) {
          query = query.gte('google_rating', minRating);
        }

        if (priceRanges && priceRanges.length > 0) {
          query = query.in('price_range', priceRanges);
        }

        const { data, error } = await query.limit(100);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Raw data from restaurants table:', data);

        let formattedData = data?.map((restaurant: any) => {
          let distance_km = null;
          if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
            distance_km = haversineDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
          }

          return {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description,
            price_range: restaurant.price_range,
            google_rating: restaurant.google_rating,
            google_rating_count: restaurant.google_rating_count,
            distance_km,
            cuisine_types: restaurant.restaurant_cuisines?.map((rc: any) => rc.cuisine_types?.name).filter(Boolean) || [],
            establishment_type: restaurant.establishment_types?.name,
            services: restaurant.restaurant_services?.map((rs: any) => rs.services?.name).filter(Boolean) || [],
            favorites_count: restaurant.favorites_count || 0,
            cover_image_url: restaurant.cover_image_url,
            logo_url: restaurant.logo_url,
            cuisine_type_ids: restaurant.restaurant_cuisines?.map((rc: any) => rc.cuisine_types?.id).filter(Boolean) || []
          };
        }).filter(Boolean) || [];

        // Apply cuisine type filter
        if (cuisineTypeIds && cuisineTypeIds.length > 0) {
          formattedData = formattedData.filter((restaurant: any) =>
            cuisineTypeIds.some(cuisineId => 
              restaurant.cuisine_type_ids?.includes(cuisineId)
            )
          );
        }

        // Apply distance filter if user location is available
        if (userLat && userLng && maxDistance) {
          formattedData = formattedData.filter((restaurant: any) =>
            !restaurant.distance_km || restaurant.distance_km <= maxDistance
          );
        }

        // Sort by distance if available, then by rating
        let sortedData = formattedData;
        if (userLat && userLng) {
          sortedData = formattedData
            .filter((restaurant: any) => restaurant.distance_km !== null)
            .sort((a: any, b: any) => {
              // First sort by distance
              const distanceDiff = (a.distance_km || 0) - (b.distance_km || 0);
              if (distanceDiff !== 0) return distanceDiff;
              
              // Then by rating (descending)
              return (b.google_rating || 0) - (a.google_rating || 0);
            });
          
          console.log('Restaurants sorted by distance and rating:', sortedData.slice(0, 5));
        } else {
          // Sort by rating only when no location
          sortedData = formattedData.sort((a: any, b: any) => 
            (b.google_rating || 0) - (a.google_rating || 0)
          );
        }

        console.log('Final formatted restaurants:', sortedData.length);
        setRestaurants(sortedData);

      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();

    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      console.log('useRestaurants: Received favoriteToggled event:', { restaurantId, newCount });
      
      setRestaurants(prev =>
        prev.map(r => 
          r.id === restaurantId 
            ? { ...r, favorites_count: Math.max(0, newCount) }
            : r
        )
      );
    };

    window.addEventListener('favoriteToggled', handleFavoriteToggled as EventListener);

    const channel = supabase
      .channel('restaurants-favorites-count')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurants' },
        (payload) => {
          const updatedRestaurant = payload.new as any;
          const restaurantId = updatedRestaurant?.id;
          const newFavoritesCount = updatedRestaurant?.favorites_count;
          
          if (typeof restaurantId === 'number' && typeof newFavoritesCount === 'number') {
            console.log('useRestaurants: Received favorites_count update from DB:', { restaurantId, newFavoritesCount });
            setRestaurants(prev =>
              prev.map(r => 
                r.id === restaurantId 
                  ? { ...r, favorites_count: Math.max(0, newFavoritesCount) }
                  : r
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggled as EventListener);
      supabase.removeChannel(channel);
    };

  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, minRating]);

  return { restaurants, loading, error };
};
