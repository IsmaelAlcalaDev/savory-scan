import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateFilters, type FilterState } from '@/utils/filterValidation';

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
  is_lactose_free: boolean;
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

interface UseDishesParams extends Partial<FilterState> {
  searchQuery?: string;
  maxDistance?: number;
  spiceLevels?: number[];
  prepTimeRanges?: number[];
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const formatPrice = (basePrice: number): string => {
  return `€${basePrice.toFixed(2)}`;
};

export const useDishes = (params: UseDishesParams = {}) => {
  const [dishes, setDishes] = useState<DishData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterWarnings, setFilterWarnings] = useState<string[]>([]);
  
  // Refs to prevent infinite loops
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<string>('');
  const isInitialMount = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    searchQuery = '',
    userLat,
    userLng,
    selectedDietTypes = [],
    selectedPriceRanges = [],
    selectedFoodTypes = [],
    selectedCuisines = [],
    selectedDistance = [],
    selectedRating,
    selectedSort,
    spiceLevels = [],
    prepTimeRanges = []
  } = params;

  // Create a stable key for the current fetch parameters
  const fetchKey = JSON.stringify({
    searchQuery,
    userLat,
    userLng,
    selectedDietTypes,
    selectedPriceRanges,
    selectedFoodTypes,
    selectedCuisines,
    selectedDistance,
    selectedRating,
    selectedSort,
    spiceLevels,
    prepTimeRanges
  });

  const fetchDishes = useCallback(async (signal: AbortSignal) => {
    try {
      console.log('useDishes: Starting fetch with key:', fetchKey);
      
      // Validate filters
      const filterState: FilterState = {
        selectedCuisines,
        selectedFoodTypes,
        selectedDistance,
        selectedPriceRanges,
        selectedRating,
        selectedEstablishmentTypes: [],
        selectedDietTypes,
        selectedSort,
        selectedTimeRanges: [],
        isOpenNow: false,
        userLat,
        userLng
      };

      const validation = validateFilters(filterState);
      setFilterWarnings(validation.warnings);

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
          is_lactose_free,
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
        .is('restaurants.deleted_at', null);

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,restaurants.name.ilike.%${searchQuery}%`);
      }

      // Apply restaurant rating filter
      if (selectedRating && selectedRating > 0) {
        query = query.gte('restaurants.google_rating', selectedRating);
      }

      // Apply restaurant price range filter
      if (selectedPriceRanges.length > 0) {
        query = query.in('restaurants.price_range', selectedPriceRanges);
      }

      // Apply spice level filter
      if (spiceLevels.length > 0) {
        query = query.in('spice_level', spiceLevels);
      }

      const { data, error: fetchError } = await query
        .limit(100)
        .abortSignal(signal);

      if (signal.aborted) return;

      if (fetchError) {
        console.error('useDishes: Supabase error:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.log('useDishes: No data returned');
        setDishes([]);
        setError(null);
        setLoading(false);
        return;
      }

      console.log('useDishes: Raw data received:', data.length, 'dishes');

      // Transform data
      const processedDishes: DishData[] = data
        .filter(dish => dish.restaurants)
        .map(dish => {
          const restaurant = dish.restaurants;
          const category = dish.dish_categories;
          
          let distance_km: number | undefined;
          if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
            distance_km = haversineDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
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
            is_lactose_free: dish.is_lactose_free,
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

      // Apply filters
      let filteredDishes = processedDishes;

      // Diet type filters
      if (selectedDietTypes.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
          return selectedDietTypes.some(dietType => {
            switch (dietType) {
              case 1: return dish.is_vegetarian; // Assuming diet type IDs
              case 2: return dish.is_vegan;
              case 3: return dish.is_gluten_free;
              case 4: return dish.is_lactose_free;
              case 5: return dish.is_healthy;
              default: return false;
            }
          });
        });
      }

      // Distance filter
      if (selectedDistance.length > 0 && userLat && userLng) {
        const maxDistanceFromFilters = Math.max(...selectedDistance.map(id => {
          switch(id) {
            case 1: return 2;
            case 2: return 5;
            case 3: return 10;
            case 4: return 20;
            default: return 50;
          }
        }));
        
        filteredDishes = filteredDishes.filter(dish =>
          dish.distance_km !== undefined && dish.distance_km <= maxDistanceFromFilters
        );
      }

      // Dish price range filters (based on dish price, not restaurant)
      if (selectedPriceRanges.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
          return selectedPriceRanges.some(range => {
            switch (range) {
              case '€': return dish.base_price <= 10;
              case '€€': return dish.base_price > 10 && dish.base_price <= 25;
              case '€€€': return dish.base_price > 25 && dish.base_price <= 50;
              case '€€€€': return dish.base_price > 50;
              default: return true;
            }
          });
        });
      }

      // Preparation time filters
      if (prepTimeRanges.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
          if (!dish.preparation_time_minutes) return false;
          return prepTimeRanges.some(range => {
            switch (range) {
              case 1: return dish.preparation_time_minutes! < 15;
              case 2: return dish.preparation_time_minutes! >= 15 && dish.preparation_time_minutes! <= 30;
              case 3: return dish.preparation_time_minutes! > 30;
              default: return true;
            }
          });
        });
      }

      // Apply sorting
      if (selectedSort) {
        switch (selectedSort) {
          case 'distance_asc':
            if (userLat && userLng) {
              filteredDishes = filteredDishes
                .filter(d => d.distance_km !== undefined)
                .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
            }
            break;
          case 'rating_desc':
            filteredDishes = filteredDishes.sort((a, b) => (b.restaurant_google_rating || 0) - (a.restaurant_google_rating || 0));
            break;
          case 'popularity_desc':
            filteredDishes = filteredDishes.sort((a, b) => b.favorites_count - a.favorites_count);
            break;
          case 'price_asc':
            filteredDishes = filteredDishes.sort((a, b) => a.base_price - b.base_price);
            break;
          case 'price_desc':
            filteredDishes = filteredDishes.sort((a, b) => b.base_price - a.base_price);
            break;
        }
      } else {
        // Default sort: featured first, then by distance if available
        filteredDishes.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          if (a.distance_km !== undefined && b.distance_km !== undefined) {
            return a.distance_km - b.distance_km;
          }
          return 0;
        });
      }

      console.log('useDishes: Final dishes to display:', filteredDishes.length);

      if (!signal.aborted) {
        setDishes(filteredDishes);
        setError(null);
        setLoading(false);
        lastFetchRef.current = fetchKey;
      }

    } catch (err) {
      if (signal.aborted) return;
      
      console.error('useDishes: Error fetching dishes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setDishes([]);
      setLoading(false);
    }
  }, [fetchKey, searchQuery, userLat, userLng, selectedDietTypes, selectedPriceRanges, selectedFoodTypes, selectedCuisines, selectedDistance, selectedRating, selectedSort, spiceLevels, prepTimeRanges]);

  useEffect(() => {
    // Skip if the fetch key hasn't changed (prevents infinite loops)
    if (lastFetchRef.current === fetchKey && !isInitialMount.current) {
      console.log('useDishes: Skipping fetch, same parameters');
      return;
    }

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Set loading state
    setLoading(true);
    setError(null);

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    // Debounce the fetch operation
    fetchTimeoutRef.current = setTimeout(() => {
      if (!currentController.signal.aborted) {
        fetchDishes(currentController.signal);
      }
    }, isInitialMount.current ? 0 : 300); // No delay on initial mount, 300ms delay on subsequent calls

    isInitialMount.current = false;

    // Cleanup function
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (currentController) {
        currentController.abort();
      }
    };
  }, [fetchKey, fetchDishes]);

  // Cleanup on unmount
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

  return { dishes, loading, error, filterWarnings };
};
