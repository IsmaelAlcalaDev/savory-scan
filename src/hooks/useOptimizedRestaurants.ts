
import { useState, useEffect, useCallback, useRef } from 'react';
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
  specializes_in_diet?: number[];
  diet_certifications?: string[];
  diet_percentages?: Record<string, number>;
}

interface UseOptimizedRestaurantsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  isOpenNow?: boolean;
  isBudgetFriendly?: boolean;
}

const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const calculateDietPercentage = (dishes: any[], category: string): number => {
  if (dishes.length === 0) return 0;
  
  const matchingDishes = dishes.filter(dish => {
    switch (category) {
      case 'vegetarian': return dish.is_vegetarian;
      case 'vegan': return dish.is_vegan;
      case 'gluten_free': return dish.is_gluten_free;
      case 'healthy': return dish.is_healthy;
      default: return false;
    }
  });
  
  return Math.round((matchingDishes.length / dishes.length) * 100);
};

// Helper to create a stable key for parameters
const createParamsKey = (params: UseOptimizedRestaurantsProps): string => {
  return JSON.stringify({
    searchQuery: params.searchQuery || '',
    userLat: params.userLat,
    userLng: params.userLng,
    maxDistance: params.maxDistance || 50,
    cuisineTypeIds: params.cuisineTypeIds?.sort() || [],
    priceRanges: params.priceRanges?.sort() || [],
    isHighRated: !!params.isHighRated,
    selectedEstablishmentTypes: params.selectedEstablishmentTypes?.sort() || [],
    selectedDietTypes: params.selectedDietTypes?.sort() || [],
    isOpenNow: !!params.isOpenNow,
    isBudgetFriendly: !!params.isBudgetFriendly
  });
};

export const useOptimizedRestaurants = (params: UseOptimizedRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache para evitar fetches repetidos
  const cacheRef = useRef<Map<string, { data: Restaurant[], timestamp: number }>>(new Map());
  const lastParamsRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const fetchRestaurants = useCallback(async (fetchParams: UseOptimizedRestaurantsProps, signal?: AbortSignal) => {
    try {
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
        isOpenNow = false,
        isBudgetFriendly = false
      } = fetchParams;

      console.log('useOptimizedRestaurants: Starting fetch with params:', fetchParams);

      // Convert price range values to display_text for filtering
      let priceDisplayTexts: string[] | undefined;
      if (priceRanges && priceRanges.length > 0) {
        const { data: priceRangeData } = await supabase
          .from('price_ranges')
          .select('value, display_text')
          .in('value', priceRanges)
          .abortSignal(signal);

        if (priceRangeData && priceRangeData.length > 0) {
          priceDisplayTexts = priceRangeData.map(range => range.display_text);
        }
      }

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
          specializes_in_diet,
          diet_certifications,
          diet_percentages,
          establishment_types!inner(name),
          restaurant_cuisines!inner(
            cuisine_types!inner(name)
          ),
          restaurant_services(
            services!inner(name)
          )
          ${isOpenNow ? `,
          restaurant_schedules!inner(
            day_of_week,
            opening_time,
            closing_time,
            is_closed
          )` : ''}
        `)
        .eq('is_active', true)
        .eq('is_published', true)
        .is('deleted_at', null)
        .abortSignal(signal);

      // Apply filters
      if (isOpenNow) {
        const currentDay = new Date().getDay();
        const currentTime = new Date().toTimeString().slice(0, 8);
        
        query = query
          .eq('restaurant_schedules.day_of_week', currentDay)
          .eq('restaurant_schedules.is_closed', false)
          .lte('restaurant_schedules.opening_time', currentTime)
          .gte('restaurant_schedules.closing_time', currentTime);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (isHighRated) {
        query = query.gte('google_rating', 4.5);
      }

      if (priceDisplayTexts && priceDisplayTexts.length > 0) {
        query = query.in('price_range', priceDisplayTexts as any);
      }

      if (cuisineTypeIds && cuisineTypeIds.length > 0) {
        query = query.in('restaurant_cuisines.cuisine_type_id', cuisineTypeIds);
      }

      if (selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0) {
        query = query.in('establishment_type_id', selectedEstablishmentTypes);
      }

      const { data, error: queryError } = await query.limit(50);

      if (queryError) {
        throw queryError;
      }

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
          specializes_in_diet: restaurant.specializes_in_diet || [],
          diet_certifications: restaurant.diet_certifications || [],
          diet_percentages: restaurant.diet_percentages || {}
        };
      }).filter(Boolean) || [];

      // Enhanced diet type filtering
      if (selectedDietTypes && selectedDietTypes.length > 0) {
        const { data: dietTypesData } = await supabase
          .from('diet_types')
          .select('*')
          .in('id', selectedDietTypes)
          .abortSignal(signal);

        if (dietTypesData && dietTypesData.length > 0) {
          const restaurantIds = formattedData.map(r => r.id);
          
          if (restaurantIds.length > 0) {
            const specializedRestaurants = new Set<number>();
            formattedData.forEach(restaurant => {
              if (restaurant.specializes_in_diet && restaurant.specializes_in_diet.length > 0) {
                const hasMatchingSpecialization = selectedDietTypes.some(dietId => 
                  restaurant.specializes_in_diet!.includes(dietId)
                );
                if (hasMatchingSpecialization) {
                  specializedRestaurants.add(restaurant.id);
                }
              }
            });

            const { data: dishesData } = await supabase
              .from('dishes')
              .select('restaurant_id, is_vegetarian, is_vegan, is_gluten_free, is_healthy')
              .in('restaurant_id', restaurantIds.filter(id => !specializedRestaurants.has(id)))
              .eq('is_active', true)
              .is('deleted_at', null)
              .abortSignal(signal);

            if (dishesData) {
              const dishesByRestaurant: Record<number, any[]> = {};
              dishesData.forEach(dish => {
                if (!dishesByRestaurant[dish.restaurant_id]) {
                  dishesByRestaurant[dish.restaurant_id] = [];
                }
                dishesByRestaurant[dish.restaurant_id].push(dish);
              });

              const calculatedRestaurants = new Set<number>();
              dietTypesData.forEach((dietType: any) => {
                Object.entries(dishesByRestaurant).forEach(([restaurantIdStr, dishes]) => {
                  const restaurantId = parseInt(restaurantIdStr);
                  const percentage = calculateDietPercentage(dishes, dietType.category);
                  
                  if (percentage >= dietType.min_percentage && percentage <= dietType.max_percentage) {
                    calculatedRestaurants.add(restaurantId);
                  }
                });
              });

              const validRestaurantIds = new Set([...specializedRestaurants, ...calculatedRestaurants]);
              formattedData = formattedData.filter(restaurant => 
                validRestaurantIds.has(restaurant.id)
              );
            } else {
              formattedData = formattedData.filter(restaurant => 
                specializedRestaurants.has(restaurant.id)
              );
            }
          }
        }
      }

      // Sort by distance if location available
      let sortedData = formattedData;
      if (userLat && userLng) {
        sortedData = formattedData
          .filter(restaurant => {
            if (restaurant.distance_km === null) return false;
            return restaurant.distance_km <= maxDistance;
          })
          .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
      }

      console.log('useOptimizedRestaurants: Fetch completed successfully:', sortedData.length, 'restaurants');
      return sortedData;

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('useOptimizedRestaurants: Fetch aborted');
        throw err;
      }
      console.error('useOptimizedRestaurants: Error fetching restaurants:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    const paramsKey = createParamsKey(params);
    
    // Si los parámetros no han cambiado, no hacer nada
    if (paramsKey === lastParamsRef.current && restaurants.length > 0) {
      console.log('useOptimizedRestaurants: Skipping fetch, same parameters');
      return;
    }

    // Cancelar request anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cancelar debounce anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Verificar cache (válido por 30 segundos)
    const cached = cacheRef.current.get(paramsKey);
    const now = Date.now();
    if (cached && (now - cached.timestamp) < 30000) {
      console.log('useOptimizedRestaurants: Using cached data');
      setRestaurants(cached.data);
      setLoading(false);
      setError(null);
      lastParamsRef.current = paramsKey;
      return;
    }

    // Debounce para evitar demasiadas llamadas rápidas
    debounceTimerRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const data = await fetchRestaurants(params, abortController.signal);
        
        if (!abortController.signal.aborted) {
          setRestaurants(data);
          lastParamsRef.current = paramsKey;
          
          // Guardar en cache
          cacheRef.current.set(paramsKey, {
            data,
            timestamp: now
          });
          
          // Limpiar cache viejo (mantener solo últimas 10 entradas)
          if (cacheRef.current.size > 10) {
            const oldestKey = cacheRef.current.keys().next().value;
            cacheRef.current.delete(oldestKey);
          }
        }
      } catch (err: any) {
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
          setRestaurants([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }, 150); // 150ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [params, fetchRestaurants]);

  // Handle favorites updates
  useEffect(() => {
    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      console.log('useOptimizedRestaurants: Received favoriteToggled event:', { restaurantId, newCount });
      
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
            console.log('useOptimizedRestaurants: Received favorites_count update from DB:', { restaurantId, newFavoritesCount });
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
  }, []);

  return { restaurants, loading, error };
};
