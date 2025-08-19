
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  google_rating: number;
  price_range: string;
  cuisine_types: string[];
  establishment_type: string;
  cover_image_url: string;
  favorites_count: number;
  distance_km?: number;
}

interface UseOpenRestaurantsProps {
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  selectedEstablishmentTypes?: number[];
}

export const useOpenRestaurants = (props: UseOpenRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    userLat,
    userLng,
    maxDistance,
    cuisineTypeIds,
    priceRanges,
    selectedEstablishmentTypes
  } = props;

  useEffect(() => {
    fetchOpenRestaurants();
  }, [userLat, userLng, maxDistance, JSON.stringify(cuisineTypeIds), JSON.stringify(priceRanges), JSON.stringify(selectedEstablishmentTypes)]);

  const fetchOpenRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('restaurants')
        .select(`
          id,
          name,
          slug,
          address,
          latitude,
          longitude,
          google_rating,
          price_range,
          cuisine_types,
          establishment_type,
          cover_image_url,
          favorites_count
        `)
        .eq('is_active', true)
        .is('deleted_at', null);

      // Filtrar solo restaurantes abiertos ahora mismo
      query = query.filter('id', 'in', `(
        SELECT r.id 
        FROM restaurants r 
        WHERE is_restaurant_open_now(r.id) = true
      )`);

      // Aplicar filtros adicionales
      if (cuisineTypeIds && cuisineTypeIds.length > 0) {
        query = query.overlaps('cuisine_type_ids', cuisineTypeIds);
      }

      if (priceRanges && priceRanges.length > 0) {
        query = query.in('price_range', priceRanges);
      }

      if (selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0) {
        query = query.in('establishment_type_id', selectedEstablishmentTypes);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching open restaurants:', fetchError);
        throw fetchError;
      }

      let processedRestaurants = data || [];

      // Calcular distancia si tenemos ubicación del usuario
      if (userLat && userLng) {
        processedRestaurants = processedRestaurants.map(restaurant => ({
          ...restaurant,
          distance_km: calculateDistance(
            userLat,
            userLng,
            restaurant.latitude,
            restaurant.longitude
          )
        }));

        // Filtrar por distancia máxima si se especifica
        if (maxDistance) {
          processedRestaurants = processedRestaurants.filter(
            restaurant => restaurant.distance_km && restaurant.distance_km <= maxDistance
          );
        }

        // Ordenar por distancia
        processedRestaurants.sort((a, b) => {
          if (a.distance_km === null && b.distance_km === null) return 0;
          if (a.distance_km === null) return 1;
          if (b.distance_km === null) return -1;
          return a.distance_km - b.distance_km;
        });
      }

      setRestaurants(processedRestaurants);
    } catch (err) {
      console.error('Error in fetchOpenRestaurants:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes abiertos');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return {
    restaurants,
    loading,
    error,
    refetch: fetchOpenRestaurants
  };
};
