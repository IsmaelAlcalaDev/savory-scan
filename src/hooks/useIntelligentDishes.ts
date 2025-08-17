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
  custom_tags: string[];
}

interface UseIntelligentDishesParams {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  selectedDietTypes?: number[];
  selectedDishDietTypes?: string[];
  selectedPriceRanges?: string[];
  selectedFoodTypes?: number[];
  selectedCustomTags?: string[];
  spiceLevels?: number[];
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

export const useIntelligentDishes = (params: UseIntelligentDishesParams = {}) => {
  const [dishes, setDishes] = useState<DishData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<string>('');
  const isInitialMount = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    searchQuery = '',
    userLat,
    userLng,
    selectedDietTypes = [],
    selectedDishDietTypes = [],
    selectedPriceRanges = [],
    selectedFoodTypes = [],
    selectedCustomTags = [],
    spiceLevels = []
  } = params;

  const fetchKey = JSON.stringify({
    searchQuery,
    userLat,
    userLng,
    selectedDietTypes,
    selectedDishDietTypes,
    selectedPriceRanges,
    selectedFoodTypes,
    selectedCustomTags,
    spiceLevels
  });

  const fetchDishes = useCallback(async (signal: AbortSignal) => {
    try {
      console.log('useIntelligentDishes: Starting fetch with key:', fetchKey);
      
      let dishIds: number[] = [];

      // Si hay búsqueda de texto, usar búsqueda inteligente
      if (searchQuery && searchQuery.trim().length > 0) {
        console.log('Using intelligent search for dishes');
        
        const { data: intelligentResults, error: intelligentError } = await supabase
          .rpc('intelligent_dish_search' as any, {
            search_query: searchQuery.trim(),
            search_limit: 100
          });

        if (intelligentError) {
          console.error('Intelligent dish search failed:', intelligentError);
        } else if (intelligentResults && Array.isArray(intelligentResults)) {
          dishIds = intelligentResults.map((d: any) => d.id);
          console.log('Intelligent search found dish IDs:', dishIds);
        }
      }

      // Construir query base
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
          custom_tags,
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
        .abortSignal(signal);

      // Aplicar filtro de búsqueda inteligente si hay resultados
      if (dishIds.length > 0) {
        query = query.in('id', dishIds);
      } else if (searchQuery && searchQuery.trim().length > 0) {
        // Fallback a búsqueda tradicional si no hay resultados inteligentes
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      query = query.limit(100);

      const { data, error: fetchError } = await query;

      if (signal.aborted) return;

      if (fetchError) {
        console.error('useIntelligentDishes: Supabase error:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.log('useIntelligentDishes: No data returned');
        setDishes([]);
        setError(null);
        setLoading(false);
        return;
      }

      console.log('useIntelligentDishes: Raw data received:', data.length, 'dishes');

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

          let customTags: string[] = [];
          if (dish.custom_tags && Array.isArray(dish.custom_tags)) {
            customTags = dish.custom_tags
              .filter((tag: any) => typeof tag === 'string' && tag.trim())
              .map((tag: any) => tag.trim());
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
            formatted_price: formatPrice(dish.base_price),
            custom_tags: customTags
          };
        });

      let filteredDishes = processedDishes;

      // Apply filters
      // Search filter is already applied via intelligent search or fallback

      // Diet type filters - Use direct boolean checks for dishes
      if (selectedDishDietTypes.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
          return selectedDishDietTypes.some(dietType => {
            switch (dietType) {
              case 'vegetarian': return dish.is_vegetarian;
              case 'vegan': return dish.is_vegan;
              case 'gluten_free': return dish.is_gluten_free;
              case 'healthy': return dish.is_healthy;
              default: return false;
            }
          });
        });
      }

      // Legacy diet type filters (for backward compatibility with restaurants)
      if (selectedDietTypes.length > 0) {
        const { data: dietTypesData, error: dietTypesError } = await supabase
          .from('diet_types')
          .select('*')
          .in('id', selectedDietTypes);

        if (!dietTypesError && dietTypesData) {
          filteredDishes = filteredDishes.filter(dish => {
            return dietTypesData.some((dietType: any) => {
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
        filteredDishes = filteredDishes.filter(dish => {
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

      // Custom tags filter - OR logic (dish must have at least one of the selected tags)
      if (selectedCustomTags.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
          return selectedCustomTags.some(selectedTag =>
            dish.custom_tags.some(dishTag => 
              dishTag.toLowerCase() === selectedTag.toLowerCase()
            )
          );
        });
      }

      // Spice level filters
      if (spiceLevels.length > 0) {
        filteredDishes = filteredDishes.filter(dish =>
          spiceLevels.includes(dish.spice_level)
        );
      }

      // Ordenar resultados
      if (dishIds.length > 0) {
        // Si usamos búsqueda inteligente, mantener el orden de relevancia
        filteredDishes.sort((a, b) => {
          const aIndex = dishIds.indexOf(a.id);
          const bIndex = dishIds.indexOf(b.id);
          if (aIndex !== bIndex) return aIndex - bIndex;
          
          // Criterios secundarios
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          if (a.distance_km !== undefined && b.distance_km !== undefined) {
            return a.distance_km - b.distance_km;
          }
          return 0;
        });
      } else {
        // Ordenar por featured y distancia
        filteredDishes.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          if (a.distance_km !== undefined && b.distance_km !== undefined) {
            return a.distance_km - b.distance_km;
          }
          return 0;
        });
      }

      console.log('useIntelligentDishes: Final dishes to display:', filteredDishes.length);

      if (!signal.aborted) {
        setDishes(filteredDishes);
        setError(null);
        setLoading(false);
        lastFetchRef.current = fetchKey;
      }

    } catch (err) {
      if (signal.aborted) return;
      
      // Handle AbortError gracefully - this is expected when requests are cancelled
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('useIntelligentDishes: Request aborted, ignoring error');
        return;
      }
      
      console.error('useIntelligentDishes: Error fetching dishes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setDishes([]);
      setLoading(false);
    }
  }, [fetchKey, searchQuery, userLat, userLng, selectedDietTypes, selectedDishDietTypes, selectedPriceRanges, selectedFoodTypes, selectedCustomTags, spiceLevels]);

  useEffect(() => {
    if (lastFetchRef.current === fetchKey && !isInitialMount.current) {
      console.log('useIntelligentDishes: Skipping fetch, same parameters');
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
    }, isInitialMount.current ? 0 : 300);

    isInitialMount.current = false;

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
