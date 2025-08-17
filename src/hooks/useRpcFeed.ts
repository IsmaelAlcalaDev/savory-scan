
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RpcFeedRestaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  establishment_type?: string;
  cover_image_url?: string;
  logo_url?: string;
  distance_km?: number;
  rating?: number;
  rating_count?: number;
  favorites_count: number;
  diet_pct?: number;
  cuisine_types: string[];
  services: string[];
}

interface UseRpcFeedProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  minDietPercentages?: Record<string, number>;
  isOpenNow?: boolean;
}

export const useRpcFeed = (props: UseRpcFeedProps) => {
  const [restaurants, setRestaurants] = useState<RpcFeedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    searchQuery = '',
    userLat,
    userLng,
    maxDistance = 50,
    cuisineTypeIds,
    priceRanges,
    isHighRated = false,
    selectedEstablishmentTypes,
    selectedDietTypes,
    minDietPercentages = {},
    isOpenNow = false
  } = props;

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('useRpcFeed: Calling optimized search_feed RPC function');

        // Preparar parámetros para la función RPC
        const rpcParams: any = {
          p_lat: userLat || null,
          p_lon: userLng || null,
          p_max_km: maxDistance,
          p_q: searchQuery.trim() || null,
          p_limit: 100,
          p_cuisines: cuisineTypeIds && cuisineTypeIds.length > 0 ? cuisineTypeIds : null,
          p_est_types: selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0 ? selectedEstablishmentTypes : null,
          p_price_bands: priceRanges && priceRanges.length > 0 ? priceRanges : null,
          p_min_rating: isHighRated ? 4.5 : null,
          p_diet: null,
          p_diet_pct_min: null
        };

        // Determinar filtro de dieta principal si hay minDietPercentages
        if (Object.keys(minDietPercentages).length > 0) {
          // Tomar el primer filtro de dieta con mayor porcentaje mínimo
          const [dietType, minPct] = Object.entries(minDietPercentages)
            .sort(([,a], [,b]) => b - a)[0];
          
          rpcParams.p_diet = dietType;
          rpcParams.p_diet_pct_min = minPct;
          console.log('useRpcFeed: Applying diet filter:', dietType, minPct);
        }

        // Llamar a la función RPC
        const { data, error } = await supabase.rpc('search_feed', rpcParams);

        if (error) {
          throw error;
        }

        // Transformar datos al formato esperado por los componentes existentes
        const formattedData = data?.map((restaurant: any) => ({
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description,
          price_range: restaurant.price_range,
          establishment_type: restaurant.establishment_type,
          cover_image_url: restaurant.cover_image_url,
          logo_url: restaurant.logo_url,
          distance_km: restaurant.distance_km ? parseFloat(restaurant.distance_km) : null,
          rating: restaurant.rating ? parseFloat(restaurant.rating) : null,
          rating_count: restaurant.rating_count || null,
          favorites_count: restaurant.favorites_count || 0,
          diet_pct: restaurant.diet_pct ? parseFloat(restaurant.diet_pct) : 0,
          cuisine_types: restaurant.cuisine_types || [],
          services: restaurant.services || []
        })) || [];

        setRestaurants(formattedData);
        console.log('useRpcFeed: Retrieved', formattedData.length, 'restaurants via RPC');

      } catch (err) {
        console.error('Error fetching restaurants via RPC:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();

    // Handle favorites updates (same as other hooks)
    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
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
      .channel('restaurants-favorites-count-rpc')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurants' },
        (payload) => {
          const updatedRestaurant = payload.new as any;
          const restaurantId = updatedRestaurant?.id;
          const newFavoritesCount = updatedRestaurant?.favorites_count;
          
          if (typeof restaurantId === 'number' && typeof newFavoritesCount === 'number') {
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

  }, [searchQuery, userLat, userLng, maxDistance, JSON.stringify(cuisineTypeIds), JSON.stringify(priceRanges), isHighRated, JSON.stringify(selectedEstablishmentTypes), JSON.stringify(selectedDietTypes), JSON.stringify(minDietPercentages), isOpenNow]);

  return { restaurants, loading, error };
};
