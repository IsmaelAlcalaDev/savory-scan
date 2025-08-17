
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DietCategoryRestaurant {
  restaurant_id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
  google_rating_count?: number;
  latitude: number;
  longitude: number;
  favorites_count: number;
  cover_image_url?: string;
  logo_url?: string;
  establishment_type?: string;
  cuisine_types: string[];
  services: string[];
  distance_km?: number;
  vegetarian_pct: number;
  vegan_pct: number;
  gluten_free_pct: number;
  healthy_pct: number;
  total_dishes: number;
}

interface UseDietCategoryRestaurantsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietCategories?: string[];
  isOpenNow?: boolean;
  isBudgetFriendly?: boolean;
}

export const useDietCategoryRestaurants = ({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 1000,
  cuisineTypeIds,
  priceRanges,
  isHighRated = false,
  selectedEstablishmentTypes,
  selectedDietCategories,
  isOpenNow = false,
  isBudgetFriendly = false
}: UseDietCategoryRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<DietCategoryRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('useDietCategoryRestaurants: Fetching with new diet categories system');

        const { data, error } = await supabase.rpc('get_restaurants_by_diet_categories', {
          diet_categories: selectedDietCategories || [],
          search_query: searchQuery,
          user_lat: userLat,
          user_lng: userLng,
          max_distance_km: maxDistance,
          cuisine_type_ids: cuisineTypeIds || [],
          price_ranges: priceRanges || [],
          is_high_rated: isHighRated,
          establishment_type_ids: selectedEstablishmentTypes || [],
          is_open_now: isOpenNow,
          is_budget_friendly: isBudgetFriendly
        });

        if (error) {
          throw error;
        }

        const formattedData: DietCategoryRestaurant[] = data?.map((restaurant: any) => {
          // Parse JSON arrays safely
          let cuisine_types: string[] = [];
          let services: string[] = [];

          try {
            cuisine_types = Array.isArray(restaurant.cuisine_types) 
              ? restaurant.cuisine_types 
              : JSON.parse(restaurant.cuisine_types || '[]');
          } catch (e) {
            cuisine_types = [];
          }

          try {
            services = Array.isArray(restaurant.services) 
              ? restaurant.services 
              : JSON.parse(restaurant.services || '[]');
          } catch (e) {
            services = [];
          }

          return {
            restaurant_id: restaurant.restaurant_id,
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description,
            price_range: restaurant.price_range,
            google_rating: restaurant.google_rating,
            google_rating_count: restaurant.google_rating_count,
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
            favorites_count: restaurant.favorites_count || 0,
            cover_image_url: restaurant.cover_image_url,
            logo_url: restaurant.logo_url,
            establishment_type: restaurant.establishment_type,
            cuisine_types,
            services,
            distance_km: restaurant.distance_km,
            vegetarian_pct: restaurant.vegetarian_pct || 0,
            vegan_pct: restaurant.vegan_pct || 0,
            gluten_free_pct: restaurant.gluten_free_pct || 0,
            healthy_pct: restaurant.healthy_pct || 0,
            total_dishes: restaurant.total_dishes || 0
          };
        }) || [];

        setRestaurants(formattedData);
        console.log('useDietCategoryRestaurants: Found', formattedData.length, 'restaurants with diet categories');

      } catch (err) {
        console.error('Error fetching restaurants with diet categories:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();

    // Handle favorites updates
    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      setRestaurants(prev =>
        prev.map(r => 
          r.restaurant_id === restaurantId 
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
            setRestaurants(prev =>
              prev.map(r => 
                r.restaurant_id === restaurantId 
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

  }, [searchQuery, userLat, userLng, maxDistance, JSON.stringify(cuisineTypeIds), JSON.stringify(priceRanges), isHighRated, JSON.stringify(selectedEstablishmentTypes), JSON.stringify(selectedDietCategories), isOpenNow, isBudgetFriendly]);

  return { restaurants, loading, error };
};
