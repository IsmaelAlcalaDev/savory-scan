
import { useState, useEffect } from 'react';
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
  // Pre-calculated diet stats
  vegan_pct?: number;
  vegetarian_pct?: number;
  glutenfree_pct?: number;
  healthy_pct?: number;
  items_total?: number;
  // Cached rating data
  cached_rating?: number;
  cached_rating_count?: number;
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

export const useOptimizedRestaurants = (props: UseOptimizedRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
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

        console.log('useOptimizedRestaurants: Using rating cache with LEFT JOIN for optimal performance');

        // Enhanced query with rating cache and diet stats LEFT JOIN
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

        // Apply other filters
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

          // Extract cached rating data from LEFT JOIN (gracefully handle NULLs)
          const cachedRating = restaurant.restaurant_rating_cache?.[0];
          
          // Extract diet stats from the LEFT JOIN
          const dietStats = restaurant.restaurant_diet_stats?.[0] || {};

          return {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description,
            price_range: restaurant.price_range,
            // Use cached rating with fallback to original google_rating
            google_rating: cachedRating?.rating ?? restaurant.google_rating,
            google_rating_count: cachedRating?.rating_count ?? restaurant.google_rating_count,
            distance_km,
            cuisine_types,
            establishment_type: restaurant.establishment_type,
            services,
            favorites_count: restaurant.favorites_count || 0,
            cover_image_url: restaurant.cover_image_url,
            logo_url: restaurant.logo_url,
            specializes_in_diet: restaurant.specializes_in_diet || [],
            diet_certifications: restaurant.diet_certifications || [],
            diet_percentages: restaurant.diet_percentages || {},
            // Include pre-calculated diet percentages
            vegan_pct: dietStats.vegan_pct || 0,
            vegetarian_pct: dietStats.vegetarian_pct || 0,
            glutenfree_pct: dietStats.glutenfree_pct || 0,
            healthy_pct: dietStats.healthy_pct || 0,
            items_total: dietStats.items_total || 0,
            // Store raw cached data for debugging
            cached_rating: cachedRating?.rating || null,
            cached_rating_count: cachedRating?.rating_count || null
          };
        }).filter(Boolean) || [];

        // Apply high-rated filter using cached ratings with graceful fallback
        if (isHighRated) {
          console.log('useOptimizedRestaurants: Filtering by high ratings using cache');
          formattedData = formattedData.filter(restaurant => {
            // Use the google_rating field which now includes cached data with fallback
            return (restaurant.google_rating || 0) >= 4.5;
          });
        }

        // Apply OPTIMIZED diet percentage filtering using pre-calculated stats
        if (Object.keys(minDietPercentages).length > 0) {
          console.log('useOptimizedRestaurants: Applying pre-calculated diet percentage filters:', minDietPercentages);
          
          formattedData = formattedData.filter(restaurant => {
            // Check vegan percentage
            if (minDietPercentages.vegan && (restaurant.vegan_pct || 0) < minDietPercentages.vegan) {
              return false;
            }
            // Check vegetarian percentage  
            if (minDietPercentages.vegetarian && (restaurant.vegetarian_pct || 0) < minDietPercentages.vegetarian) {
              return false;
            }
            // Check gluten-free percentage
            if (minDietPercentages.glutenfree && (restaurant.glutenfree_pct || 0) < minDietPercentages.glutenfree) {
              return false;
            }
            // Check healthy percentage
            if (minDietPercentages.healthy && (restaurant.healthy_pct || 0) < minDietPercentages.healthy) {
              return false;
            }
            return true;
          });
        }

        // FALLBACK: Apply legacy diet type filtering for selectedDietTypes if needed
        if (selectedDietTypes && selectedDietTypes.length > 0) {
          const { data: dietTypesData } = await supabase
            .from('diet_types')
            .select('*')
            .in('id', selectedDietTypes);

          if (dietTypesData && dietTypesData.length > 0) {
            const validRestaurantIds = new Set<number>();
            
            formattedData.forEach(restaurant => {
              // First try with pre-calculated percentages
              for (const dietType of dietTypesData) {
                const minPercentage = dietType.min_percentage || 0;
                let meetsRequirement = false;
                
                switch (dietType.category) {
                  case 'vegan':
                    meetsRequirement = (restaurant.vegan_pct || 0) >= minPercentage;
                    break;
                  case 'vegetarian':
                    meetsRequirement = (restaurant.vegetarian_pct || 0) >= minPercentage;
                    break;
                  case 'gluten_free':
                    meetsRequirement = (restaurant.glutenfree_pct || 0) >= minPercentage;
                    break;
                  case 'healthy':
                    meetsRequirement = (restaurant.healthy_pct || 0) >= minPercentage;
                    break;
                }
                
                if (meetsRequirement) {
                  validRestaurantIds.add(restaurant.id);
                  break; // Found matching diet type, no need to check others
                }
              }
              
              // Fallback to specializes_in_diet if no pre-calculated stats match
              if (!validRestaurantIds.has(restaurant.id) && restaurant.specializes_in_diet && restaurant.specializes_in_diet.length > 0) {
                const hasMatchingSpecialization = selectedDietTypes.some(dietId => 
                  restaurant.specializes_in_diet!.includes(dietId)
                );
                if (hasMatchingSpecialization) {
                  validRestaurantIds.add(restaurant.id);
                }
              }
            });

            formattedData = formattedData.filter(restaurant => 
              validRestaurantIds.has(restaurant.id)
            );
          }
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
          // Sort by favorites and rating for general queries
          sortedData = formattedData.sort((a, b) => {
            return (b.favorites_count || 0) - (a.favorites_count || 0);
          });
        }

        setRestaurants(sortedData);
        console.log('useOptimizedRestaurants: Final results with cached ratings and diet stats:', sortedData.length);

      } catch (err) {
        console.error('Error fetching optimized restaurants:', err);
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

    // Listen for rating cache updates
    const ratingCacheChannel = supabase
      .channel('restaurant-rating-cache-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurant_rating_cache' },
        (payload) => {
          console.log('Rating cache updated:', payload);
          // Could trigger a refresh or update specific restaurant ratings
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggled as EventListener);
      supabase.removeChannel(channel);
      supabase.removeChannel(ratingCacheChannel);
    };

  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, isHighRated, selectedEstablishmentTypes, selectedDietTypes, JSON.stringify(minDietPercentages), isOpenNow]);

  return { restaurants, loading, error };
};
