
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
    isOpenNow = false
  } = props;

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);

        let restaurantIds: number[] = [];

        // Use trigram search for text queries
        if (searchQuery && searchQuery.trim().length > 0) {
          console.log('Using optimized trigram search for restaurants');
          
          const { data: searchResults, error: searchError } = await supabase
            .rpc('intelligent_restaurant_search', {
              search_query: searchQuery.trim(),
              search_limit: 100
            });

          if (searchError) {
            console.error('Trigram search failed:', searchError);
          } else if (searchResults && Array.isArray(searchResults)) {
            restaurantIds = searchResults.map((r: any) => r.id);
            console.log('Trigram search found restaurant IDs:', restaurantIds);
          }
        }

        // Use geographic search for location-based queries
        let nearbyIds: number[] = [];
        if (userLat && userLng && !searchQuery) {
          console.log('Using KNN geographic search');
          
          const { data: nearbyResults, error: geoError } = await supabase
            .rpc('restaurants_near_location', {
              user_lat: userLat,
              user_lng: userLng,
              max_distance_km: maxDistance,
              search_limit: 100
            });

          if (geoError) {
            console.error('Geographic search failed:', geoError);
          } else if (nearbyResults && Array.isArray(nearbyResults)) {
            nearbyIds = nearbyResults.map((r: any) => r.id);
            console.log('Geographic search found restaurant IDs:', nearbyIds);
          }
        }

        // Query the optimized view
        let query = supabase
          .from('restaurants_list_optimized')
          .select('*');

        // Apply search filter
        if (restaurantIds.length > 0) {
          query = query.in('id', restaurantIds);
        } else if (nearbyIds.length > 0) {
          query = query.in('id', nearbyIds);
        } else if (searchQuery && searchQuery.trim().length > 0) {
          // Fallback to simple text search if trigram fails
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // Apply filters
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
            specializes_in_diet: restaurant.specializes_in_diet || [],
            diet_certifications: restaurant.diet_certifications || [],
            diet_percentages: restaurant.diet_percentages || {}
          };
        }).filter(Boolean) || [];

        // Apply diet type filtering (client-side for now, can be optimized later)
        if (selectedDietTypes && selectedDietTypes.length > 0) {
          const { data: dietTypesData } = await supabase
            .from('diet_types')
            .select('*')
            .in('id', selectedDietTypes);

          if (dietTypesData && dietTypesData.length > 0) {
            const validRestaurantIds = new Set<number>();
            
            formattedData.forEach(restaurant => {
              if (restaurant.specializes_in_diet && restaurant.specializes_in_diet.length > 0) {
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
        if (restaurantIds.length > 0) {
          // Maintain search relevance order
          sortedData = formattedData.sort((a, b) => {
            const aIndex = restaurantIds.indexOf(a.id);
            const bIndex = restaurantIds.indexOf(b.id);
            return aIndex - bIndex;
          });
        } else if (nearbyIds.length > 0) {
          // Maintain geographic proximity order
          sortedData = formattedData.sort((a, b) => {
            const aIndex = nearbyIds.indexOf(a.id);
            const bIndex = nearbyIds.indexOf(b.id);
            return aIndex - bIndex;
          });
        } else if (userLat && userLng) {
          // Sort by distance for general location queries
          sortedData = formattedData
            .filter(restaurant => {
              if (restaurant.distance_km === null) return false;
              return restaurant.distance_km <= maxDistance;
            })
            .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
        }

        setRestaurants(sortedData);

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

    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggled as EventListener);
      supabase.removeChannel(channel);
    };

  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, isHighRated, selectedEstablishmentTypes, selectedDietTypes, isOpenNow]);

  return { restaurants, loading, error };
};
