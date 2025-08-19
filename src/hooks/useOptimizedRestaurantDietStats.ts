import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RestaurantWithDietStats {
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
  // Pre-calculated diet stats
  vegan_pct?: number;
  vegetarian_pct?: number;
  glutenfree_pct?: number;
  healthy_pct?: number;
  items_total?: number;
}

interface UseOptimizedRestaurantDietStatsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  minDietPercentages?: Record<string, number>; // New: min percentages for diet filters
  isOpenNow?: boolean;
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

export const useOptimizedRestaurantDietStats = (props: UseOptimizedRestaurantDietStatsProps) => {
  const [restaurants, setRestaurants] = useState<RestaurantWithDietStats[]>([]);
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

        console.log('useOptimizedRestaurantDietStats: Fetching with pre-calculated diet stats');

        // Use optimized query with diet stats JOIN
        let query = supabase
          .from('restaurants_full')
          .select(`
            *,
            restaurant_diet_stats!inner (
              vegan_pct,
              vegetarian_pct,
              glutenfree_pct,
              healthy_pct,
              items_total
            )
          `);

        // Apply search filter
        if (searchQuery && searchQuery.trim().length > 0) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // Apply diet percentage filters EFFICIENTLY using pre-calculated stats
        if (minDietPercentages.vegan && minDietPercentages.vegan > 0) {
          query = query.gte('restaurant_diet_stats.vegan_pct', minDietPercentages.vegan);
        }
        if (minDietPercentages.vegetarian && minDietPercentages.vegetarian > 0) {
          query = query.gte('restaurant_diet_stats.vegetarian_pct', minDietPercentages.vegetarian);
        }
        if (minDietPercentages.glutenfree && minDietPercentages.glutenfree > 0) {
          query = query.gte('restaurant_diet_stats.glutenfree_pct', minDietPercentages.glutenfree);
        }
        if (minDietPercentages.healthy && minDietPercentages.healthy > 0) {
          query = query.gte('restaurant_diet_stats.healthy_pct', minDietPercentages.healthy);
        }

        // Apply other existing filters
        if (isHighRated) {
          query = query.gte('google_rating', 4.5);
        }

        if (priceRanges && priceRanges.length > 0) {
          const { data: priceRangeData } = await supabase
            .from('price_ranges')
            .select('value, display_text')
            .in('value', priceRanges);

          if (priceRangeData && priceRangeData.length > 0) {
            const priceDisplayTexts = priceRangeData.map(range => range.display_text);
            query = query.in('price_range', priceDisplayTexts as any);
          }
        }

        if (selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0) {
          query = query.in('establishment_type_id', selectedEstablishmentTypes);
        }

        const { data, error } = await query.limit(100);

        if (error) {
          throw error;
        }

        let formattedData = data?.map((restaurant: any) => {
          let distance_km = null;
          if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
            distance_km = haversineDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
          }

          // Parse JSON arrays from the view
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

          // Extract diet stats from the JOIN
          const dietStats = restaurant.restaurant_diet_stats?.[0] || {};

          return {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description,
            price_range: restaurant.price_range,
            google_rating: restaurant.google_rating,
            google_rating_count: restaurant.google_rating_count,
            distance_km,
            cuisine_types,
            establishment_type: restaurant.establishment_type,
            services,
            favorites_count: restaurant.favorites_count || 0,
            cover_image_url: restaurant.cover_image_url,
            logo_url: restaurant.logo_url,
            // Include pre-calculated diet percentages
            vegan_pct: dietStats.vegan_pct || 0,
            vegetarian_pct: dietStats.vegetarian_pct || 0,
            glutenfree_pct: dietStats.glutenfree_pct || 0,
            healthy_pct: dietStats.healthy_pct || 0,
            items_total: dietStats.items_total || 0
          };
        }).filter(Boolean) || [];

        // Apply legacy diet type filtering if needed (fallback)
        if (selectedDietTypes && selectedDietTypes.length > 0) {
          const { data: dietTypesData } = await supabase
            .from('diet_types')
            .select('*')
            .in('id', selectedDietTypes);

          if (dietTypesData && dietTypesData.length > 0) {
            // Filter by diet specializations as fallback
            formattedData = formattedData.filter(restaurant => {
              // Use percentage-based filtering when available
              for (const dietType of dietTypesData) {
                const minPercentage = dietType.min_percentage || 0;
                switch (dietType.category) {
                  case 'vegan':
                    if ((restaurant.vegan_pct || 0) >= minPercentage) return true;
                    break;
                  case 'vegetarian':
                    if ((restaurant.vegetarian_pct || 0) >= minPercentage) return true;
                    break;
                  case 'gluten_free':
                    if ((restaurant.glutenfree_pct || 0) >= minPercentage) return true;
                    break;
                  case 'healthy':
                    if ((restaurant.healthy_pct || 0) >= minPercentage) return true;
                    break;
                }
              }
              return false;
            });
          }
        }

        // Sort results
        let sortedData = formattedData;
        if (userLat && userLng) {
          sortedData = formattedData
            .filter(restaurant => {
              if (restaurant.distance_km === null) return false;
              return restaurant.distance_km <= maxDistance;
            })
            .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
        } else {
          sortedData = formattedData.sort((a, b) => (b.favorites_count || 0) - (a.favorites_count || 0));
        }

        setRestaurants(sortedData);
        console.log('useOptimizedRestaurantDietStats: Fetched', sortedData.length, 'restaurants with diet stats');

      } catch (err) {
        console.error('Error fetching restaurants with diet stats:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();

    // Handle favorites updates (keep existing realtime functionality)
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

  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, isHighRated, selectedEstablishmentTypes, selectedDietTypes, JSON.stringify(minDietPercentages), isOpenNow]);

  return { restaurants, loading, error };
};
