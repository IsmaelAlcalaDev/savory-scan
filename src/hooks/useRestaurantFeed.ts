import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RestaurantFeedItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  distance_km?: number;
  google_rating?: number;
  google_rating_count?: number;
  price_range: string;
  cover_image_url?: string;
  logo_url?: string;
  cuisine_types: Array<{ name: string; slug: string }>;
  establishment_type?: string;
  services: string[];
  favorites_count: number;
  vegan_pct: number;
  vegetarian_pct: number;
  glutenfree_pct: number;
  healthy_pct: number;
  items_total: number;
}

interface UseRestaurantFeedProps {
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
  sortBy?: 'distance' | 'rating' | 'favorites';
}

export const useRestaurantFeed = (props: UseRestaurantFeedProps) => {
  const [restaurants, setRestaurants] = useState<RestaurantFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverTiming, setServerTiming] = useState<number | null>(null);

  const {
    searchQuery = '',
    userLat,
    userLng,
    maxDistance = 50,
    cuisineTypeIds,
    priceRanges,
    isHighRated = false,
    selectedEstablishmentTypes,
    selectedDietCategories,
    isOpenNow = false,
    sortBy = 'favorites'
  } = props;

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setServerTiming(null);

      console.log('useRestaurantFeed: Fetching with edge function', {
        searchQuery,
        userLat,
        userLng,
        maxDistance,
        cuisineTypeIds,
        priceRanges,
        isHighRated,
        selectedEstablishmentTypes,
        selectedDietCategories,
        isOpenNow
      });

      // Use edge function for better performance monitoring
      const { data, error } = await supabase.functions.invoke('search-restaurant-feed', {
        body: {
          search_query: searchQuery.trim(),
          user_lat: userLat || null,
          user_lon: userLng || null,
          max_distance_km: maxDistance,
          cuisine_type_ids: cuisineTypeIds && cuisineTypeIds.length > 0 ? cuisineTypeIds : null,
          price_ranges: priceRanges && priceRanges.length > 0 ? priceRanges : null,
          establishment_type_ids: selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0 ? selectedEstablishmentTypes : null,
          diet_categories: selectedDietCategories && selectedDietCategories.length > 0 ? selectedDietCategories : null,
          min_rating: isHighRated ? 4.5 : null,
          is_open_now: isOpenNow,
          max_results: 50
        }
      });

      // Extract Server-Timing header if available
      if (data && typeof data === 'object' && 'headers' in data) {
        const serverTimingHeader = data.headers?.['server-timing'];
        if (serverTimingHeader) {
          const match = serverTimingHeader.match(/feed;dur=([0-9.]+)/);
          if (match) {
            setServerTiming(parseFloat(match[1]));
          }
        }
      }

      if (error) {
        console.error('useRestaurantFeed: Edge function error:', error);
        throw error;
      }

      const responseData = data?.data || data;

      if (responseData && Array.isArray(responseData)) {
        const formattedData: RestaurantFeedItem[] = responseData.map((item: any) => {
          // Parse JSON fields safely
          let cuisine_types: Array<{ name: string; slug: string }> = [];
          let services: string[] = [];

          try {
            cuisine_types = Array.isArray(item.cuisine_types) 
              ? item.cuisine_types 
              : JSON.parse(item.cuisine_types || '[]');
          } catch (e) {
            cuisine_types = [];
          }

          try {
            services = Array.isArray(item.services) 
              ? item.services 
              : JSON.parse(item.services || '[]');
          } catch (e) {
            services = [];
          }

          return {
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            distance_km: item.distance_km ? Number(item.distance_km) : undefined,
            google_rating: item.google_rating,
            google_rating_count: item.google_rating_count,
            price_range: item.price_range,
            cover_image_url: item.cover_image_url,
            logo_url: item.logo_url,
            cuisine_types,
            establishment_type: item.establishment_type,
            services,
            favorites_count: item.favorites_count || 0,
            vegan_pct: Number(item.vegan_pct || 0),
            vegetarian_pct: Number(item.vegetarian_pct || 0),
            glutenfree_pct: Number(item.glutenfree_pct || 0),
            healthy_pct: Number(item.healthy_pct || 0),
            items_total: Number(item.items_total || 0)
          };
        });

        console.log('useRestaurantFeed: Formatted results:', formattedData.length, 'restaurants');
        if (serverTiming) {
          console.log(`Feed search took ${serverTiming.toFixed(3)}ms on server`);
        }
        setRestaurants(formattedData);
      } else {
        setRestaurants([]);
      }

    } catch (err) {
      console.error('useRestaurantFeed: Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    userLat,
    userLng,
    maxDistance,
    JSON.stringify(cuisineTypeIds),
    JSON.stringify(priceRanges),
    isHighRated,
    JSON.stringify(selectedEstablishmentTypes),
    JSON.stringify(selectedDietCategories),
    isOpenNow,
    sortBy
  ]);

  useEffect(() => {
    // Debounce search queries for better performance
    const debounceTimer = setTimeout(fetchRestaurants, searchQuery ? 250 : 100);
    return () => clearTimeout(debounceTimer);
  }, [fetchRestaurants]);

  // Handle favorites updates via event system
  useEffect(() => {
    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      console.log('useRestaurantFeed: Received favoriteToggled event:', { restaurantId, newCount });
      
      setRestaurants(prev =>
        prev.map(r => 
          r.id === restaurantId 
            ? { ...r, favorites_count: Math.max(0, newCount) }
            : r
        )
      );
    };

    window.addEventListener('favoriteToggled', handleFavoriteToggled as EventListener);

    // Real-time subscription for favorites count
    const channel = supabase
      .channel('restaurants-favorites-feed')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurants' },
        (payload) => {
          const updatedRestaurant = payload.new as any;
          const restaurantId = updatedRestaurant?.id;
          const newFavoritesCount = updatedRestaurant?.favorites_count;
          
          if (typeof restaurantId === 'number' && typeof newFavoritesCount === 'number') {
            console.log('useRestaurantFeed: Received favorites_count update from DB:', { restaurantId, newFavoritesCount });
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
  }, []);

  return { restaurants, loading, error, refetch: fetchRestaurants, serverTiming };
};
