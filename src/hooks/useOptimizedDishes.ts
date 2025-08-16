
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DishData {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  image_alt?: string;
  is_featured: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_healthy: boolean;
  spice_level: number;
  preparation_time_minutes?: number;
  favorites_count: number;
  category_name?: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_slug: string;
  restaurant_latitude: number;
  restaurant_longitude: number;
  restaurant_price_range: string;
  restaurant_google_rating?: number;
  distance_km?: number;
  formatted_price: string;
}

interface UseOptimizedDishesParams {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  selectedDietTypes?: number[];
  selectedPriceRanges?: string[];
  selectedFoodTypes?: number[];
  spiceLevels?: number[];
  prepTimeRanges?: number[];
}

const formatPrice = (basePrice: number): string => {
  return `€${basePrice.toFixed(2)}`;
};

export const useOptimizedDishes = (params: UseOptimizedDishesParams = {}) => {
  const [dishes, setDishes] = useState<DishData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<string>('');
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    searchQuery = '',
    userLat,
    userLng,
    maxDistance = 50,
    selectedDietTypes = [],
    selectedPriceRanges = [],
    selectedFoodTypes = [],
    spiceLevels = [],
    prepTimeRanges = []
  } = params;

  const fetchKey = JSON.stringify({
    searchQuery,
    userLat,
    userLng,
    maxDistance,
    selectedDietTypes,
    selectedPriceRanges,
    selectedFoodTypes,
    spiceLevels,
    prepTimeRanges
  });

  const fetchDishes = useCallback(async (signal: AbortSignal) => {
    try {
      console.log('useOptimizedDishes: Starting optimized fetch');
      
      // Build optimized query with joins
      let query = supabase
        .from('dishes')
        .select(`
          id,
          name,
          description,
          base_price,
          image_url,
          image_alt,
          is_featured,
          is_vegetarian,
          is_vegan,
          is_gluten_free,
          is_healthy,
          spice_level,
          preparation_time_minutes,
          favorites_count,
          restaurants!inner (
            id,
            name,
            slug,
            latitude,
            longitude,
            price_range,
            google_rating,
            is_active
          ),
          dish_categories (
            name
          )
        `)
        .eq('is_active', true)
        .eq('restaurants.is_active', true)
        .eq('restaurants.is_published', true)
        .is('deleted_at', null)
        .is('restaurants.deleted_at', null);

      // Apply search filter at SQL level
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,restaurants.name.ilike.%${searchQuery}%`);
      }

      // Apply spice level filter at SQL level
      if (spiceLevels.length > 0) {
        query = query.in('spice_level', spiceLevels);
      }

      // Apply preparation time filters at SQL level
      if (prepTimeRanges.length > 0) {
        const timeConditions = prepTimeRanges.map(range => {
          switch (range) {
            case 1: return 'preparation_time_minutes.lt.15';
            case 2: return 'preparation_time_minutes.gte.15,preparation_time_minutes.lte.30';
            case 3: return 'preparation_time_minutes.gt.30';
            default: return null;
          }
        }).filter(Boolean);
        
        if (timeConditions.length > 0) {
          query = query.or(timeConditions.join(','));
        }
      }

      const { data, error: fetchError } = await query
        .limit(100)
        .abortSignal(signal);

      if (signal.aborted) return;

      if (fetchError) {
        console.error('useOptimizedDishes: Supabase error:', fetchError);
        throw fetchError;
      }

      if (!data) {
        setDishes([]);
        setError(null);
        setLoading(false);
        return;
      }

      console.log('useOptimizedDishes: Processing', data.length, 'dishes');

      // Process dishes with optimized distance calculation using earthdistance if needed
      let processedDishes: DishData[] = data
        .filter(dish => dish.restaurants)
        .map(dish => {
          const restaurant = dish.restaurants;
          const category = dish.dish_categories;
          
          let distance_km: number | undefined;
          if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
            // Use Haversine formula for client-side calculation (faster for small datasets)
            const R = 6371;
            const dLat = (restaurant.latitude - userLat) * Math.PI / 180;
            const dLon = (restaurant.longitude - userLng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(restaurant.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            distance_km = Math.round((R * c) * 100) / 100;
          }

          return {
            id: dish.id,
            name: dish.name,
            description: dish.description,
            base_price: dish.base_price,
            image_url: dish.image_url,
            image_alt: dish.image_alt,
            is_featured: dish.is_featured,
            is_vegetarian: dish.is_vegetarian,
            is_vegan: dish.is_vegan,
            is_gluten_free: dish.is_gluten_free,
            is_healthy: dish.is_healthy,
            spice_level: dish.spice_level,
            preparation_time_minutes: dish.preparation_time_minutes,
            favorites_count: dish.favorites_count,
            category_name: category?.name,
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.name,
            restaurant_slug: restaurant.slug,
            restaurant_latitude: restaurant.latitude,
            restaurant_longitude: restaurant.longitude,
            restaurant_price_range: restaurant.price_range,
            restaurant_google_rating: restaurant.google_rating,
            distance_km,
            formatted_price: formatPrice(dish.base_price)
          };
        });

      // Apply remaining filters
      if (userLat && userLng && maxDistance) {
        processedDishes = processedDishes.filter(dish => 
          !dish.distance_km || dish.distance_km <= maxDistance
        );
      }

      // Diet type filters - use efficient batch processing
      if (selectedDietTypes.length > 0) {
        const { data: dietTypesData } = await supabase
          .from('diet_types')
          .select('*')
          .in('id', selectedDietTypes);

        if (dietTypesData) {
          processedDishes = processedDishes.filter(dish => {
            return dietTypesData.some(dietType => {
              switch (dietType.category) {
                case 'vegetarian': return dish.is_vegetarian;
                case 'vegan': return dish.is_vegan;
                case 'gluten_free': return dish.is_gluten_free;
                case 'healthy': return dish.is_healthy;
                default: return false;
              }
            });
          });
        }
      }

      // Price range filters
      if (selectedPriceRanges.length > 0) {
        processedDishes = processedDishes.filter(dish => {
          return selectedPriceRanges.some(range => {
            switch (range) {
              case 'budget': return dish.base_price <= 10;
              case 'mid': return dish.base_price > 10 && dish.base_price <= 25;
              case 'premium': return dish.base_price > 25;
              default: return true;
            }
          });
        });
      }

      // Sort by featured first, then by distance
      processedDishes.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        if (a.distance_km !== undefined && b.distance_km !== undefined) {
          return a.distance_km - b.distance_km;
        }
        return 0;
      });

      console.log('useOptimizedDishes: Final dishes:', processedDishes.length);

      if (!signal.aborted) {
        setDishes(processedDishes);
        setError(null);
        setLoading(false);
        lastFetchRef.current = fetchKey;
      }

    } catch (err) {
      if (signal.aborted) return;
      
      console.error('useOptimizedDishes: Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setDishes([]);
      setLoading(false);
    }
  }, [fetchKey, searchQuery, userLat, userLng, selectedDietTypes, selectedPriceRanges, selectedFoodTypes, spiceLevels, prepTimeRanges, maxDistance]);

  useEffect(() => {
    if (lastFetchRef.current === fetchKey) {
      return;
    }

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    fetchTimeoutRef.current = setTimeout(() => {
      if (!currentController.signal.aborted) {
        fetchDishes(currentController.signal);
      }
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (currentController) {
        currentController.abort();
      }
    };
  }, [fetchKey, fetchDishes]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return { dishes, loading, error };
};
