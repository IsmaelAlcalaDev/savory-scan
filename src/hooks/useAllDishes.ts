
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Dish } from '@/hooks/useRestaurantMenu';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface DishWithRestaurant extends Dish {
  restaurant: Restaurant;
  distance_km?: number;
}

type PriceRange = '€' | '€€' | '€€€' | '€€€€';

interface UseAllDishesProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  foodTypeIds?: number[];
  priceRanges?: PriceRange[];
  minRating?: number;
  dietTypes?: string[];
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

export const useAllDishes = ({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 50,
  foodTypeIds,
  priceRanges,
  minRating = 0,
  dietTypes
}: UseAllDishesProps) => {
  const [dishes, setDishes] = useState<DishWithRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching all dishes with params:', {
          searchQuery,
          userLat,
          userLng,
          maxDistance,
          foodTypeIds,
          priceRanges,
          minRating,
          dietTypes
        });

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
            category_id,
            restaurant_id,
            dish_categories!dishes_category_id_fkey(name),
            dish_variants(id, name, price, is_default, display_order),
            restaurants!dishes_restaurant_id_fkey(
              id,
              name,
              slug,
              latitude,
              longitude,
              address,
              google_rating,
              price_range
            )
          `)
          .eq('is_active', true)
          .is('deleted_at', null)
          .eq('restaurants.is_active', true)
          .eq('restaurants.is_published', true)
          .is('restaurants.deleted_at', null);

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        if (minRating > 0) {
          query = query.gte('restaurants.google_rating', minRating);
        }

        if (priceRanges && priceRanges.length > 0) {
          query = query.in('restaurants.price_range', priceRanges);
        }

        // Filter by diet types if specified
        if (dietTypes && dietTypes.length > 0) {
          const dietConditions = [];
          if (dietTypes.includes('vegetarian')) dietConditions.push('is_vegetarian.eq.true');
          if (dietTypes.includes('vegan')) dietConditions.push('is_vegan.eq.true');
          if (dietTypes.includes('gluten-free')) dietConditions.push('is_gluten_free.eq.true');
          if (dietTypes.includes('lactose-free')) dietConditions.push('is_lactose_free.eq.true');
          if (dietTypes.includes('healthy')) dietConditions.push('is_healthy.eq.true');
          
          if (dietConditions.length > 0) {
            query = query.or(dietConditions.join(','));
          }
        }

        const { data, error } = await query.limit(100);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Raw data from dishes table:', data);

        const formattedData = data?.map((dish: any) => {
          let distance_km = null;
          if (userLat && userLng && dish.restaurants?.latitude && dish.restaurants?.longitude) {
            distance_km = haversineDistance(userLat, userLng, dish.restaurants.latitude, dish.restaurants.longitude);
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
            category_name: dish.dish_categories?.name,
            restaurant: {
              id: dish.restaurants?.id,
              name: dish.restaurants?.name,
              slug: dish.restaurants?.slug,
              latitude: dish.restaurants?.latitude,
              longitude: dish.restaurants?.longitude,
              address: dish.restaurants?.address
            },
            distance_km,
            variants: (dish.dish_variants || [])
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((variant: any) => ({
                id: variant.id,
                name: variant.name,
                price: variant.price,
                is_default: variant.is_default
              }))
          };
        }).filter(Boolean) || [];

        let sortedData = formattedData;
        if (userLat && userLng) {
          sortedData = formattedData
            .filter(dish => dish.distance_km !== null)
            .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
          
          console.log('Dishes sorted by distance:', sortedData.slice(0, 5));
        }

        console.log('Final formatted dishes:', sortedData.length);
        setDishes(sortedData);

      } catch (err) {
        console.error('Error fetching dishes:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar platos');
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();

  }, [searchQuery, userLat, userLng, maxDistance, foodTypeIds, priceRanges, minRating, dietTypes]);

  return { dishes, loading, error };
};
