import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateFilters, type FilterState } from '@/utils/filterValidation';

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
}

type PriceRange = '€' | '€€' | '€€€' | '€€€€';

interface UseRestaurantsProps extends Partial<FilterState> {
  searchQuery?: string;
  maxDistance?: number;
}

const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getCurrentTime = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes(); // Convert to minutes
};

const getCurrentDay = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

export const useRestaurants = ({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 50,
  selectedCuisines = [],
  selectedDistance = [],
  selectedPriceRanges = [],
  selectedRating,
  selectedEstablishmentTypes = [],
  selectedDietTypes = [],
  selectedSort,
  selectedTimeRanges = [],
  isOpenNow = false
}: UseRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterWarnings, setFilterWarnings] = useState<string[]>([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate filters
        const filterState: FilterState = {
          selectedCuisines,
          selectedFoodTypes: [],
          selectedDistance,
          selectedPriceRanges: selectedPriceRanges as ('€' | '€€' | '€€€' | '€€€€')[],
          selectedRating,
          selectedEstablishmentTypes,
          selectedDietTypes,
          selectedSort,
          selectedTimeRanges,
          isOpenNow,
          userLat,
          userLng
        };

        const validation = validateFilters(filterState);
        setFilterWarnings(validation.warnings);

        console.log('Fetching restaurants with params:', {
          searchQuery,
          userLat,
          userLng,
          maxDistance,
          selectedCuisines,
          selectedDistance,
          selectedPriceRanges,
          selectedRating,
          selectedEstablishmentTypes,
          selectedDietTypes,
          selectedSort,
          selectedTimeRanges,
          isOpenNow
        });

        let query = supabase
          .from('restaurants')
          .select(`
            id,
            name,
            slug,
            description,
            price_range,
            google_rating,
            google_rating_count,
            latitude,
            longitude,
            favorites_count,
            cover_image_url,
            logo_url,
            establishment_types!inner(name),
            restaurant_cuisines!inner(
              cuisine_types!inner(name)
            ),
            restaurant_services(
              services!inner(name)
            )
          `)
          .eq('is_active', true)
          .eq('is_published', true)
          .is('deleted_at', null);

        // Apply search filter
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // Apply rating filter
        if (selectedRating && selectedRating > 0) {
          query = query.gte('google_rating', selectedRating);
        }

        // Apply price range filter
        if (selectedPriceRanges && selectedPriceRanges.length > 0) {
          query = query.in('price_range', selectedPriceRanges as readonly ('€' | '€€' | '€€€' | '€€€€')[]);
        }

        // Apply cuisine type filter
        if (selectedCuisines && selectedCuisines.length > 0) {
          query = query.in('restaurant_cuisines.cuisine_types.id', selectedCuisines);
        }

        // Apply establishment type filter
        if (selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0) {
          query = query.in('establishment_types.id', selectedEstablishmentTypes);
        }

        const { data, error } = await query.limit(100);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Raw data from restaurants table:', data);

        let formattedData = data?.map((restaurant: any) => {
          let distance_km = null;
          if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
            distance_km = haversineDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
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
            cuisine_types: restaurant.restaurant_cuisines?.map((rc: any) => rc.cuisine_types?.name).filter(Boolean) || [],
            establishment_type: restaurant.establishment_types?.name,
            services: restaurant.restaurant_services?.map((rs: any) => rs.services?.name).filter(Boolean) || [],
            favorites_count: restaurant.favorites_count || 0,
            cover_image_url: restaurant.cover_image_url,
            logo_url: restaurant.logo_url
          };
        }).filter(Boolean) || [];

        // Apply distance filter after calculation
        if (selectedDistance.length > 0 && userLat && userLng) {
          // Get distance ranges from the selected IDs (for now, using simple km values)
          // In a real implementation, you'd fetch the actual distance_ranges from the database
          const maxDistanceFromFilters = Math.max(...selectedDistance.map(id => {
            // Simple mapping - in real app, fetch from distance_ranges table
            switch(id) {
              case 1: return 2;
              case 2: return 5;
              case 3: return 10;
              case 4: return 20;
              default: return 50;
            }
          }));
          
          formattedData = formattedData.filter(restaurant => 
            restaurant.distance_km !== null && restaurant.distance_km <= maxDistanceFromFilters
          );
        }

        // Apply diet type filters (check if restaurant has dishes with those diet characteristics)
        if (selectedDietTypes.length > 0) {
          // This would require a more complex query joining with dishes
          // For now, we'll implement a basic filter based on cuisine types
          // In a real implementation, you'd query the dishes table for diet information
        }

        // Apply time range and "open now" filters
        if (isOpenNow || selectedTimeRanges.length > 0) {
          const currentTime = getCurrentTime();
          const currentDay = getCurrentDay();
          
          // For now, we'll just log this - in a real implementation,
          // you'd need a restaurant_hours table to filter by
          console.log('Time filters would be applied here:', { currentTime, currentDay, isOpenNow, selectedTimeRanges });
        }

        // Apply sorting
        let sortedData = [...formattedData];
        if (selectedSort) {
          switch (selectedSort) {
            case 'distance_asc':
              if (userLat && userLng) {
                sortedData = sortedData
                  .filter(r => r.distance_km !== null)
                  .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
              }
              break;
            case 'rating_desc':
              sortedData = sortedData.sort((a, b) => (b.google_rating || 0) - (a.google_rating || 0));
              break;
            case 'popularity_desc':
              sortedData = sortedData.sort((a, b) => b.favorites_count - a.favorites_count);
              break;
            case 'price_asc':
              sortedData = sortedData.sort((a, b) => {
                const priceOrder = { '€': 1, '€€': 2, '€€€': 3, '€€€€': 4 };
                return (priceOrder[a.price_range as keyof typeof priceOrder] || 0) - 
                       (priceOrder[b.price_range as keyof typeof priceOrder] || 0);
              });
              break;
            case 'price_desc':
              sortedData = sortedData.sort((a, b) => {
                const priceOrder = { '€': 1, '€€': 2, '€€€': 3, '€€€€': 4 };
                return (priceOrder[b.price_range as keyof typeof priceOrder] || 0) - 
                       (priceOrder[a.price_range as keyof typeof priceOrder] || 0);
              });
              break;
            default:
              // Default sorting by distance if available, then by rating
              if (userLat && userLng) {
                sortedData = sortedData
                  .filter(r => r.distance_km !== null)
                  .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
              } else {
                sortedData = sortedData.sort((a, b) => (b.google_rating || 0) - (a.google_rating || 0));
              }
          }
        } else if (userLat && userLng) {
          // Default: sort by distance
          sortedData = sortedData
            .filter(r => r.distance_km !== null)
            .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
        }

        console.log('Final formatted restaurants:', sortedData.length);
        setRestaurants(sortedData);

      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();

    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      console.log('useRestaurants: Received favoriteToggled event:', { restaurantId, newCount });
      
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
            console.log('useRestaurants: Received favorites_count update from DB:', { restaurantId, newFavoritesCount });
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

  }, [searchQuery, userLat, userLng, maxDistance, selectedCuisines, selectedDistance, selectedPriceRanges, selectedRating, selectedEstablishmentTypes, selectedDietTypes, selectedSort, selectedTimeRanges, isOpenNow]);

  return { restaurants, loading, error, filterWarnings };
};
