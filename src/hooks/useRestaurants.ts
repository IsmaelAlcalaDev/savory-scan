
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

export const useRestaurants = ({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 50, // Aumentamos el rango por defecto
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

        // Obtener restaurantes de la tabla
        let query = supabase
          .from('restaurants')
          .select(`
            id,
            name,
            slug,
            description,
            price_range,
            google_rating,
            latitude,
            longitude,
            establishment_types!inner(name),
            restaurant_cuisines!inner(
              cuisine_types!inner(name)
            )
          `)
          .eq('is_active', true)
          .eq('is_published', true)
          .is('deleted_at', null);

        // Agregar filtro de búsqueda si se proporciona
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // Agregar filtro de rating
        if (minRating > 0) {
          query = query.gte('google_rating', minRating);
        }

        // Agregar filtro de rango de precios
        if (priceRanges && priceRanges.length > 0) {
          query = query.in('price_range', priceRanges);
        }

        const { data, error } = await query.limit(50); // Aumentamos el límite

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Raw data from restaurants table:', data);

        const formattedData = data?.map((restaurant: any) => {
          // Calcular distancia si se proporciona la ubicación del usuario
          let distance_km = null;
          if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
            const R = 6371; // Radio de la Tierra en km
            const dLat = (restaurant.latitude - userLat) * Math.PI / 180;
            const dLon = (restaurant.longitude - userLng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(restaurant.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            distance_km = R * c;
          }

          return {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description,
            price_range: restaurant.price_range,
            google_rating: restaurant.google_rating,
            distance_km,
            cuisine_types: restaurant.restaurant_cuisines?.map((rc: any) => rc.cuisine_types?.name).filter(Boolean) || [],
            establishment_type: restaurant.establishment_types?.name
          };
        }).filter(Boolean) || [];

        // Si hay ubicación del usuario, ordenar por distancia pero NO filtrar por distancia máxima
        // Solo calculamos la distancia para mostrarla, pero mostramos todos los restaurantes
        let sortedData = formattedData;
        if (userLat && userLng) {
          sortedData = formattedData
            .filter(restaurant => restaurant.distance_km !== null)
            .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
          
          console.log('Restaurants sorted by distance:', sortedData.slice(0, 5));
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
  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, minRating]);

  return { restaurants, loading, error };
};
