
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
  distance_km?: number;
  cuisine_types: string[];
  establishment_type?: string;
  services: string[];
  favorites_count: number;
  cover_image_url?: string;
  logo_url?: string;
  subscription_plan?: string;
}

interface UseInfiniteRestaurantsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  isOpenNow?: boolean;
  sortBy?: 'recommended' | 'distance';
}

const PAGE_SIZE = 12;
const MAX_DISTANCE_KM = 5;

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

export const useInfiniteRestaurants = (props: UseInfiniteRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialLoad = useRef(true);

  const {
    searchQuery = '',
    userLat,
    userLng,
    cuisineTypeIds,
    priceRanges,
    isHighRated = false,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow = false,
    sortBy = 'recommended'
  } = props;

  console.log('useInfiniteRestaurants: sortBy =', sortBy);

  const fetchRestaurants = useCallback(async (pageOffset: number, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('useInfiniteRestaurants: Fetching restaurants', { 
        pageOffset, 
        isLoadMore, 
        userLat, 
        userLng,
        maxDistance: MAX_DISTANCE_KM,
        sortBy 
      });

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

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
          subscription_plan,
          establishment_types!inner(name),
          restaurant_cuisines!inner(
            cuisine_types!inner(name)
          ),
          restaurant_services(
            services!inner(name)
          )
          ${isOpenNow ? `,
          restaurant_schedules!inner(
            day_of_week,
            opening_time,
            closing_time,
            is_closed
          )` : ''}
        `)
        .eq('is_active', true)
        .eq('is_published', true)
        .is('deleted_at', null);

      if (isOpenNow) {
        const currentDay = new Date().getDay();
        const currentTime = new Date().toTimeString().slice(0, 8);
        
        query = query
          .eq('restaurant_schedules.day_of_week', currentDay)
          .eq('restaurant_schedules.is_closed', false)
          .lte('restaurant_schedules.opening_time', currentTime)
          .gte('restaurant_schedules.closing_time', currentTime);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (isHighRated) {
        query = query.gte('google_rating', 4.5);
      }

      if (priceRanges && priceRanges.length > 0) {
        const { data: priceRangeData, error: priceError } = await supabase
          .from('price_ranges')
          .select('value, display_text')
          .in('value', priceRanges);

        if (!priceError && priceRangeData && priceRangeData.length > 0) {
          const priceDisplayTexts = priceRangeData.map(range => range.display_text);
          query = query.in('price_range', priceDisplayTexts as any);
        }
      }

      if (cuisineTypeIds && cuisineTypeIds.length > 0) {
        query = query.in('restaurant_cuisines.cuisine_type_id', cuisineTypeIds);
      }

      if (selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0) {
        query = query.in('establishment_type_id', selectedEstablishmentTypes);
      }

      const { data, error } = await query
        .range(pageOffset, pageOffset + PAGE_SIZE - 1)
        .abortSignal(abortControllerRef.current.signal);

      if (error) {
        console.error('useInfiniteRestaurants: Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.log('useInfiniteRestaurants: No data returned');
        if (!isLoadMore) {
          setRestaurants([]);
        }
        setHasMore(false);
        return;
      }

      console.log('useInfiniteRestaurants: Raw data received:', data.length, 'restaurants');

      let formattedData = data.map((restaurant: any) => {
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
          logo_url: restaurant.logo_url,
          subscription_plan: restaurant.subscription_plan || 'free'
        };
      }).filter(Boolean) || [];

      // Filter by 5km distance if user location is available
      if (userLat && userLng) {
        formattedData = formattedData.filter(restaurant => 
          restaurant.distance_km === null || restaurant.distance_km <= MAX_DISTANCE_KM
        );
        console.log(`useInfiniteRestaurants: Filtered to ${formattedData.length} restaurants within ${MAX_DISTANCE_KM}km`);
      }

      // Apply diet type filters if needed
      if (selectedDietTypes && selectedDietTypes.length > 0) {
        const { data: dietTypesData, error: dietTypesError } = await supabase
          .from('diet_types')
          .select('*')
          .in('id', selectedDietTypes);

        if (!dietTypesError && dietTypesData && dietTypesData.length > 0) {
          const validRestaurantIds = new Set<number>();
          
          for (const restaurant of formattedData) {
            const { data: dishesData, error: dishesError } = await supabase
              .from('dishes')
              .select('id, is_vegetarian, is_vegan, is_gluten_free, is_healthy')
              .eq('restaurant_id', restaurant.id)
              .eq('is_active', true)
              .is('deleted_at', null);

            if (dishesError || !dishesData || dishesData.length === 0) {
              continue;
            }

            const totalDishes = dishesData.length;

            for (const dietType of dietTypesData) {
              let dietDishesCount = 0;
              
              switch (dietType.category) {
                case 'vegetarian':
                  dietDishesCount = dishesData.filter(d => d.is_vegetarian).length;
                  break;
                case 'vegan':
                  dietDishesCount = dishesData.filter(d => d.is_vegan).length;
                  break;
                case 'gluten_free':
                  dietDishesCount = dishesData.filter(d => d.is_gluten_free).length;
                  break;
                case 'healthy':
                  dietDishesCount = dishesData.filter(d => d.is_healthy).length;
                  break;
              }
              
              const percentage = (dietDishesCount / totalDishes) * 100;
              
              if (percentage >= 20) {
                validRestaurantIds.add(restaurant.id);
                break;
              }
            }
          }

          formattedData = formattedData.filter(restaurant => 
            validRestaurantIds.has(restaurant.id)
          );
        }
      }

      // Sort restaurants according to sortBy
      const sortedData = formattedData.sort((a, b) => {
        switch (sortBy) {
          case 'recommended':
            // First premium restaurants by distance, then free restaurants by favorites/rating
            const aPremium = a.subscription_plan === 'premium';
            const bPremium = b.subscription_plan === 'premium';
            
            if (aPremium && !bPremium) return -1;
            if (!aPremium && bPremium) return 1;
            
            if (aPremium && bPremium) {
              // Both premium: sort by distance
              if (a.distance_km === null && b.distance_km === null) return 0;
              if (a.distance_km === null) return 1;
              if (b.distance_km === null) return -1;
              return a.distance_km - b.distance_km;
            } else {
              // Both free: sort by favorites count, then rating
              if (b.favorites_count !== a.favorites_count) {
                return (b.favorites_count || 0) - (a.favorites_count || 0);
              }
              return (b.google_rating || 0) - (a.google_rating || 0);
            }
            
          case 'distance':
          default:
            if (a.distance_km === null && b.distance_km === null) return 0;
            if (a.distance_km === null) return 1;
            if (b.distance_km === null) return -1;
            return a.distance_km - b.distance_km;
        }
      });

      console.log('useInfiniteRestaurants: Final restaurants for page:', sortedData.length, 'sortBy:', sortBy);

      if (isLoadMore) {
        setRestaurants(prev => [...prev, ...sortedData]);
      } else {
        setRestaurants(sortedData);
      }

      // Check if there are more pages
      setHasMore(sortedData.length === PAGE_SIZE);

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('useInfiniteRestaurants: Error fetching restaurants:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [
    searchQuery, userLat, userLng, cuisineTypeIds, priceRanges, isHighRated,
    selectedEstablishmentTypes, selectedDietTypes, isOpenNow, sortBy
  ]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextOffset = offset + PAGE_SIZE;
      setOffset(nextOffset);
      fetchRestaurants(nextOffset, true);
    }
  }, [offset, loadingMore, hasMore, fetchRestaurants]);

  const refetch = useCallback(() => {
    setOffset(0);
    setHasMore(true);
    fetchRestaurants(0, false);
  }, [fetchRestaurants]);

  // Initial load and filter changes
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    } else {
      // Reset pagination when filters change
      setOffset(0);
      setHasMore(true);
    }
    fetchRestaurants(0, false);
  }, [fetchRestaurants]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    restaurants,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch
  };
};
