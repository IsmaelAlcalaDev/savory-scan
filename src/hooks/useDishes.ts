
import { useState, useEffect } from 'react';
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

interface UseDishesParams {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  selectedDietTypes?: string[];
  selectedPriceRanges?: string[];
  selectedFoodTypes?: number[];
  spiceLevels?: number[];
  prepTimeRanges?: number[];
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
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

  const {
    searchQuery,
    userLat,
    userLng,
    selectedDietTypes = [],
    selectedPriceRanges = [],
    selectedFoodTypes = [],
    spiceLevels = [],
    prepTimeRanges = []
  } = params;

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        console.log('useDishes: Starting fetch with params:', params);
        setLoading(true);
        setError(null);

        // Fetch dishes with restaurant information
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
          .limit(100);

        if (fetchError) {
          console.error('useDishes: Supabase error:', fetchError);
          throw fetchError;
        }

        console.log('useDishes: Raw data received:', data?.length || 0, 'dishes');

        if (!data || data.length === 0) {
          console.log('useDishes: No data returned from query');
          setDishes([]);
          return;
        }

        // Transform data
        const processedDishes: DishData[] = data.map(dish => {
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

        console.log('useDishes: Processed dishes:', processedDishes.length);

        // Apply filters
        let filteredDishes = processedDishes;

        // Search filter
        if (searchQuery && searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          filteredDishes = filteredDishes.filter(dish =>
            dish.name.toLowerCase().includes(query) ||
            dish.description?.toLowerCase().includes(query) ||
            dish.restaurant_name.toLowerCase().includes(query)
          );
          console.log('useDishes: After search filter:', filteredDishes.length);
        }

        // Diet type filters
        if (selectedDietTypes.length > 0) {
          filteredDishes = filteredDishes.filter(dish => {
            return selectedDietTypes.some(dietType => {
              switch (dietType) {
                case 'vegetarian':
                  return dish.is_vegetarian;
                case 'vegan':
                  return dish.is_vegan;
                case 'gluten-free':
                  return dish.is_gluten_free;
                case 'lactose-free':
                  return dish.is_lactose_free;
                case 'healthy':
                  return dish.is_healthy;
                default:
                  return false;
              }
            });
          });
          console.log('useDishes: After diet filter:', filteredDishes.length);
        }

        // Price range filters
        if (selectedPriceRanges.length > 0) {
          filteredDishes = filteredDishes.filter(dish => {
            return selectedPriceRanges.some(range => {
              switch (range) {
                case 'budget':
                  return dish.base_price <= 10;
                case 'mid':
                  return dish.base_price > 10 && dish.base_price <= 25;
                case 'premium':
                  return dish.base_price > 25;
                default:
                  return true;
              }
            });
          });
          console.log('useDishes: After price filter:', filteredDishes.length);
        }

        // Spice level filters
        if (spiceLevels.length > 0) {
          filteredDishes = filteredDishes.filter(dish =>
            spiceLevels.includes(dish.spice_level)
          );
          console.log('useDishes: After spice filter:', filteredDishes.length);
        }

        // Preparation time filters
        if (prepTimeRanges.length > 0) {
          filteredDishes = filteredDishes.filter(dish => {
            if (!dish.preparation_time_minutes) return false;
            return prepTimeRanges.some(range => {
              switch (range) {
                case 1: // < 15 minutes
                  return dish.preparation_time_minutes! < 15;
                case 2: // 15-30 minutes
                  return dish.preparation_time_minutes! >= 15 && dish.preparation_time_minutes! <= 30;
                case 3: // > 30 minutes
                  return dish.preparation_time_minutes! > 30;
                default:
                  return true;
              }
            });
          });
          console.log('useDishes: After time filter:', filteredDishes.length);
        }

        // Sort by distance if available, then by featured status
        filteredDishes.sort((a, b) => {
          if (a.distance_km !== undefined && b.distance_km !== undefined) {
            return a.distance_km - b.distance_km;
          }
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return 0;
        });

        console.log('useDishes: Final dishes to display:', filteredDishes.length);
        setDishes(filteredDishes);

      } catch (err) {
        console.error('useDishes: Error in fetchDishes:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar platos';
        setError(errorMessage);
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [searchQuery, userLat, userLng, selectedDietTypes, selectedPriceRanges, selectedFoodTypes, spiceLevels, prepTimeRanges]);

  console.log('useDishes: Hook returning:', { dishes: dishes.length, loading, error });

  return { dishes, loading, error };
};
