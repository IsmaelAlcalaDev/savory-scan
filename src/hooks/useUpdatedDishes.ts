
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DishFilters } from '@/types/dishFilters';

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
  allergens: string[];
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

export const useUpdatedDishes = (filters: DishFilters = {}) => {
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
    selectedPriceRanges = [],
    selectedFoodTypes = [],
    isVegetarian,
    isVegan,
    isGlutenFree,
    isHealthy,
    selectedCustomTags = [],
    excludedAllergens = [],
    selectedSpiceLevels = [],
    sortByPopularity = false
  } = filters;

  const fetchKey = JSON.stringify({
    searchQuery,
    userLat,
    userLng,
    selectedPriceRanges,
    selectedFoodTypes,
    isVegetarian,
    isVegan,
    isGlutenFree,
    isHealthy,
    selectedCustomTags,
    excludedAllergens,
    selectedSpiceLevels,
    sortByPopularity
  });

  const fetchDishes = useCallback(async (signal: AbortSignal) => {
    try {
      console.log('useUpdatedDishes: Starting fetch with key:', fetchKey);
      
      const { data, error: fetchError } = await supabase
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
          allergens,
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
        .limit(100)
        .abortSignal(signal);

      if (signal.aborted) return;

      if (fetchError) {
        console.error('useUpdatedDishes: Supabase error:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.log('useUpdatedDishes: No data returned');
        setDishes([]);
        setError(null);
        setLoading(false);
        return;
      }

      console.log('useUpdatedDishes: Raw data received:', data.length, 'dishes');

      const processedDishes: DishData[] = data
        .filter(dish => dish.restaurants)
        .map(dish => {
          const restaurant = dish.restaurants;
          const category = dish.dish_categories;
          
          let distance_km: number | undefined;
          if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
            distance_km = haversineDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
          }

          // Safely handle JSON arrays from Supabase
          const customTags = Array.isArray(dish.custom_tags) 
            ? dish.custom_tags.filter((tag): tag is string => typeof tag === 'string')
            : [];
          
          const allergens = Array.isArray(dish.allergens)
            ? dish.allergens.filter((allergen): allergen is string => typeof allergen === 'string')
            : [];

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
            custom_tags: customTags,
            allergens: allergens
          };
        });

      let filteredDishes = processedDishes;

      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredDishes = filteredDishes.filter(dish =>
          dish.name.toLowerCase().includes(query) ||
          dish.description?.toLowerCase().includes(query) ||
          dish.restaurant_name.toLowerCase().includes(query)
        );
      }

      // Filtros dietéticos booleanos
      if (isVegetarian) {
        filteredDishes = filteredDishes.filter(dish => dish.is_vegetarian);
      }
      if (isVegan) {
        filteredDishes = filteredDishes.filter(dish => dish.is_vegan);
      }
      if (isGlutenFree) {
        filteredDishes = filteredDishes.filter(dish => dish.is_gluten_free);
      }
      if (isHealthy) {
        filteredDishes = filteredDishes.filter(dish => dish.is_healthy);
      }

      // Filtro de rangos de precio
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

      // Filtro de etiquetas personalizadas
      if (selectedCustomTags.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
          return selectedCustomTags.some(tag => dish.custom_tags.includes(tag));
        });
      }

      // Filtro de alérgenos (exclusión)
      if (excludedAllergens.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
          return !excludedAllergens.some(allergen => dish.allergens.includes(allergen));
        });
      }

      // Filtro de nivel de picante
      if (selectedSpiceLevels.length > 0) {
        filteredDishes = filteredDishes.filter(dish =>
          selectedSpiceLevels.includes(dish.spice_level)
        );
      }

      // Ordenación
      filteredDishes.sort((a, b) => {
        // Primero por destacados
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        
        // Luego por popularidad si está activado
        if (sortByPopularity) {
          if (a.favorites_count !== b.favorites_count) {
            return b.favorites_count - a.favorites_count;
          }
        }
        
        // Finalmente por distancia si está disponible
        if (a.distance_km !== undefined && b.distance_km !== undefined) {
          return a.distance_km - b.distance_km;
        }
        
        return 0;
      });

      console.log('useUpdatedDishes: Final dishes to display:', filteredDishes.length);

      if (!signal.aborted) {
        setDishes(filteredDishes);
        setError(null);
        setLoading(false);
        lastFetchRef.current = fetchKey;
      }

    } catch (err) {
      if (signal.aborted) return;
      
      console.error('useUpdatedDishes: Error fetching dishes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setDishes([]);
      setLoading(false);
    }
  }, [fetchKey, searchQuery, userLat, userLng, selectedPriceRanges, selectedFoodTypes,
      isVegetarian, isVegan, isGlutenFree, isHealthy, selectedCustomTags, 
      excludedAllergens, selectedSpiceLevels, sortByPopularity]);

  useEffect(() => {
    if (lastFetchRef.current === fetchKey && !isInitialMount.current) {
      console.log('useUpdatedDishes: Skipping fetch, same parameters');
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
