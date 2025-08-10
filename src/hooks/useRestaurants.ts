
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

        // Obtener restaurantes con servicios, favoritos, imágenes y google_rating_count
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
              cuisine_types!inner(name)
            ),
            restaurant_services(
              services!inner(name)
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

        const { data, error } = await query.limit(50);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Raw data from restaurants table:', data);

        const formattedData = data?.map((restaurant: any) => {
          // Calcular distancia si se proporciona la ubicación del usuario
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
            logo_url: restaurant.logo_url
          };
        }).filter(Boolean) || [];

        // Si hay ubicación del usuario, ordenar por distancia
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

    // Configurar listener para cambios en tiempo real en favorites
    const channel = supabase
      .channel('restaurants-favorites')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_saved_restaurants'
        },
        (payload) => {
          console.log('Favorite change detected:', payload);
          // Actualizar solo el contador de favoritos para el restaurante específico
          if (payload.new && typeof payload.new === 'object' && 'restaurant_id' in payload.new) {
            const restaurantId = payload.new.restaurant_id;
            setRestaurants(prevRestaurants => 
              prevRestaurants.map(restaurant => {
                if (restaurant.id === restaurantId) {
                  const increment = payload.eventType === 'INSERT' && payload.new.is_active ? 1 : 
                                  payload.eventType === 'UPDATE' && payload.old && 
                                  payload.old.is_active !== payload.new.is_active ? 
                                  (payload.new.is_active ? 1 : -1) : 0;
                  return {
                    ...restaurant,
                    favorites_count: Math.max(0, restaurant.favorites_count + increment)
                  };
                }
                return restaurant;
              })
            );
          }
        }
      )
      .subscribe();

    // Cleanup function para remover el listener
    return () => {
      supabase.removeChannel(channel);
    };

  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, minRating]);

  return { restaurants, loading, error };
};
