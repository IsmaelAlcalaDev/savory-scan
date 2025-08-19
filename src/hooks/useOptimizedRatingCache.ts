import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RestaurantWithCachedRating {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  distance_km?: number;
  cuisine_types: string[];
  establishment_type?: string;
  services: string[];
  favorites_count: number;
  cover_image_url?: string;
  logo_url?: string;
  // Cached rating data (can be null if not cached yet)
  cached_rating?: number;
  cached_rating_count?: number;
  cached_rating_last_sync?: string;
  // Pre-calculated diet stats
  vegan_pct?: number;
  vegetarian_pct?: number;
  glutenfree_pct?: number;
  healthy_pct?: number;
  items_total?: number;
}

interface UseOptimizedRatingCacheProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  minDietPercentages?: Record<string, number>;
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

export const useOptimizedRatingCache = (props: UseOptimizedRatingCacheProps) => {
  const [restaurants, setRestaurants] = useState<RestaurantWithCachedRating[]>([]);
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

        console.log('useOptimizedRatingCache: Using cached ratings with LEFT JOIN');

        // Enhanced query with rating cache LEFT JOIN and diet stats LEFT JOIN
        let query = supabase
          .from('restaurants_full')
          .select(`
            *,
            restaurant_rating_cache (
              rating,
              rating_count,
              last_sync
            ),
            restaurant_diet_stats (
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

        // Apply high-rated filter using cached ratings with fallback
        if (isHighRated) {
          // This will work with cached ratings when available, gracefully handle NULLs
          console.log('useOptimizedRatingCache: Applying high rating filter with cache fallback');
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
            console.warn('Failed to parse cuisine_types:', restaurant.cuisine_types);
            cuisine_types = [];
          }

          try {
            services = Array.isArray(restaurant.services) 
              ? restaurant.services 
              : JSON.parse(restaurant.services || '[]');
          } catch (e) {
            console.warn('Failed to parse services:', restaurant.services);
            services = [];
          }

          // Extract cached rating data from LEFT JOIN (can be null)
          const cachedRating = restaurant.restaurant_rating_cache?.[0];
          
          // Extract diet stats from the LEFT JOIN
          const dietStats = restaurant.restaurant_diet_stats?.[0] || {};

          return {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description,
            price_range: restaurant.price_range,
            distance_km,
            cuisine_types,
            establishment_type: restaurant.establishment_type,
            services,
            favorites_count: restaurant.favorites_count || 0,
            cover_image_url: restaurant.cover_image_url,
            logo_url: restaurant.logo_url,
            // Cached rating data (gracefully handle NULLs)
            cached_rating: cachedRating?.rating || null,
            cached_rating_count: cachedRating?.rating_count || null,
            cached_rating_last_sync: cachedRating?.last_sync || null,
            // Include pre-calculated diet percentages
            vegan_pct: dietStats.vegan_pct || 0,
            vegetarian_pct: dietStats.vegetarian_pct || 0,
            glutenfree_pct: dietStats.glutenfree_pct || 0,
            healthy_pct: dietStats.healthy_pct || 0,
            items_total: dietStats.items_total || 0
          };
        }).filter(Boolean) || [];

        // Apply high-rated filter after data processing to handle NULLs gracefully
        if (isHighRated) {
          console.log('useOptimizedRatingCache: Filtering by high ratings (>= 4.5) from cache');
          formattedData = formattedData.filter(restaurant => {
            // Use cached rating if available, otherwise skip (don't exclude)
            if (restaurant.cached_rating !== null && restaurant.cached_rating !== undefined) {
              return restaurant.cached_rating >= 4.5;
            }
            // If no cached rating, include restaurant (graceful degradation)
            return true;
          });
        }

        // Apply diet percentage filtering using pre-calculated stats
        if (Object.keys(minDietPercentages).length > 0) {
          console.log('useOptimizedRatingCache: Applying diet percentage filters:', minDietPercentages);
          
          formattedData = formattedData.filter(restaurant => {
            if (minDietPercentages.vegan && (restaurant.vegan_pct || 0) < minDietPercentages.vegan) {
              return false;
            }
            if (minDietPercentages.vegetarian && (restaurant.vegetarian_pct || 0) < minDietPercentages.vegetarian) {
              return false;
            }
            if (minDietPercentages.glutenfree && (restaurant.glutenfree_pct || 0) < minDietPercentages.glutenfree) {
              return false;
            }
            if (minDietPercentages.healthy && (restaurant.healthy_pct || 0) < minDietPercentages.healthy) {
              return false;
            }
            return true;
          });
        }

        // Sort results
        let sortedData = formattedData;
        if (userLat && userLng) {
          // Sort by distance for location queries
          sortedData = formattedData
            .filter(restaurant => {
              if (restaurant.distance_km === null) return false;
              return restaurant.distance_km <= maxDistance;
            })
            .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
        } else {
          // Sort by cached rating first, then favorites
          sortedData = formattedData.sort((a, b) => {
            // Prioritize restaurants with cached ratings
            const aRating = a.cached_rating || 0;
            const bRating = b.cached_rating || 0;
            
            if (aRating !== bRating) {
              return bRating - aRating;
            }
            
            return (b.favorites_count || 0) - (a.favorites_count || 0);
          });
        }

        setRestaurants(sortedData);
        console.log('useOptimizedRatingCache: Results with cached ratings:', sortedData.length);

      } catch (err) {
        console.error('Error fetching restaurants with rating cache:', err);
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
