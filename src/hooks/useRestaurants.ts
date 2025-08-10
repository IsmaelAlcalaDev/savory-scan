
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
  distance_km?: number;
  cuisine_types: string[];
  establishment_type?: string;
}

interface UseRestaurantsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  minRating?: number;
}

export const useRestaurants = ({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 10,
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
        const { data, error } = await supabase.rpc('search_restaurants', {
          search_query: searchQuery,
          user_lat: userLat,
          user_lng: userLng,
          max_distance_km: maxDistance,
          cuisine_type_ids: cuisineTypeIds,
          price_ranges: priceRanges,
          min_rating: minRating,
          limit_count: 20
        });

        if (error) throw error;

        const formattedData = data?.map((restaurant: any) => ({
          id: restaurant.restaurant_id,
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description,
          price_range: restaurant.price_range,
          google_rating: restaurant.google_rating,
          distance_km: restaurant.distance_km,
          cuisine_types: restaurant.cuisine_types || [],
          establishment_type: restaurant.establishment_type
        })) || [];

        setRestaurants(formattedData);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, minRating]);

  return { restaurants, loading, error };
};
