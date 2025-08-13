
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/types/filters';
import { useFilterLogic } from './useFilterLogic';

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
  filters?: FilterState;
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
  const { applyFilterLogic } = useFilterLogic();

  const {
    searchQuery,
    userLat,
    userLng,
    filters
  } = params;

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        console.log('useDishes: Fetching dishes with filters:', filters);
        setLoading(true);

        // Fetch dishes with restaurant and category information
        const { data, error } = await supabase
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

        if (error) {
          console.error('useDishes: Error fetching dishes:', error);
          setError(error.message);
          return;
        }

        if (!data) {
          console.log('useDishes: No dishes data returned');
          setDishes([]);
          return;
        }

        console.log('useDishes: Raw dishes data received:', data.length);

        // Transform data
        let processedDishes: DishData[] = data.map(dish => {
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

        // Apply search filter
        if (searchQuery && searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          processedDishes = processedDishes.filter(dish =>
            dish.name.toLowerCase().includes(query) ||
            dish.description?.toLowerCase().includes(query) ||
            dish.restaurant_name.toLowerCase().includes(query)
          );
        }

        // Apply advanced filtering with new logic
        if (filters) {
          processedDishes = applyFilterLogic(processedDishes, filters);
        }

        // Sort by distance if available, then by featured status
        processedDishes.sort((a, b) => {
          if (a.distance_km !== undefined && b.distance_km !== undefined) {
            return a.distance_km - b.distance_km;
          }
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return 0;
        });

        console.log('useDishes: Processed dishes:', processedDishes.length);
        setDishes(processedDishes);
        setError(null);

      } catch (err) {
        console.error('useDishes: Unexpected error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [searchQuery, userLat, userLng, filters, applyFilterLogic]);

  return { dishes, loading, error };
};
