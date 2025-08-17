import { useState, useEffect, useCallback } from 'react';
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

interface Cursor {
  value: number | string;
  id: number;
}

interface UsePaginatedRestaurantsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  sortBy?: 'distance' | 'rating' | 'favorites';
  pageSize?: number;
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

export const usePaginatedRestaurants = (props: UsePaginatedRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<Cursor | null>(null);
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
    selectedDietTypes,
    sortBy = 'favorites',
    pageSize = 50
  } = props;

  const fetchRestaurants = useCallback(async (isLoadMore = false) => {
    try {
      const startTime = performance.now();
      
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCursor(null);
        setHasMore(true);
      }
      setError(null);
      setServerTiming(null);

      let query = supabase
        .from('restaurants_full')
        .select('*');

      // Apply search filter
      if (searchQuery && searchQuery.trim().length > 0) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply other filters
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

      // Apply keyset pagination cursor
      if (isLoadMore && cursor) {
        switch (sortBy) {
          case 'rating':
            query = query.or(`google_rating.lt.${cursor.value},and(google_rating.eq.${cursor.value},id.gt.${cursor.id})`);
            break;
          case 'favorites':
            query = query.or(`favorites_count.lt.${cursor.value},and(favorites_count.eq.${cursor.value},id.gt.${cursor.id})`);
            break;
          default:
            query = query.gt('id', cursor.id);
        }
      }

      // Apply ordering
      switch (sortBy) {
        case 'rating':
          query = query.order('google_rating', { ascending: false }).order('id', { ascending: true });
          break;
        case 'favorites':
          query = query.order('favorites_count', { ascending: false }).order('id', { ascending: true });
          break;
        default:
          query = query.order('favorites_count', { ascending: false }).order('id', { ascending: true });
      }

      query = query.limit(pageSize + 1); // +1 to check if there are more results

      const { data, error } = await query;
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      setServerTiming(duration);

      if (error) {
        throw error;
      }

      let formattedData = data?.map((restaurant: any) => {
        let distance_km = null;
        if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
          distance_km = haversineDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
        }

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

      // Apply diet type filtering
      if (selectedDietTypes && selectedDietTypes.length > 0) {
        const specializedRestaurants = new Set<number>();
        formattedData.forEach(restaurant => {
          if (restaurant.specializes_in_diet && restaurant.specializes_in_diet.length > 0) {
            const hasMatchingSpecialization = selectedDietTypes.some(dietId => 
              restaurant.specializes_in_diet!.includes(dietId)
            );
            if (hasMatchingSpecialization) {
              specializedRestaurants.add(restaurant.id);
            }
          }
        });

        formattedData = formattedData.filter(restaurant => 
          specializedRestaurants.has(restaurant.id)
        );
      }

      // Apply distance filtering and sorting for geographic queries
      if (userLat && userLng) {
        formattedData = formattedData
          .filter(restaurant => {
            if (restaurant.distance_km === null) return false;
            return restaurant.distance_km <= maxDistance;
          });
        
        if (sortBy === 'distance') {
          formattedData.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
        }
      }

      // Check if there are more results
      const hasMoreResults = formattedData.length > pageSize;
      if (hasMoreResults) {
        formattedData = formattedData.slice(0, pageSize);
      }
      setHasMore(hasMoreResults);

      // Set cursor for next page
      if (formattedData.length > 0) {
        const lastItem = formattedData[formattedData.length - 1];
        let cursorValue: number | string;
        
        switch (sortBy) {
          case 'rating':
            cursorValue = lastItem.google_rating || 0;
            break;
          case 'favorites':
            cursorValue = lastItem.favorites_count || 0;
            break;
          case 'distance':
            cursorValue = lastItem.distance_km || 0;
            break;
          default:
            cursorValue = lastItem.favorites_count || 0;
        }
        
        setCursor({ value: cursorValue, id: lastItem.id });
      }

      if (isLoadMore) {
        setRestaurants(prev => [...prev, ...formattedData]);
      } else {
        setRestaurants(formattedData);
      }

    } catch (err) {
      console.error('Error fetching paginated restaurants:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
      if (!isLoadMore) {
        setRestaurants([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, isHighRated, selectedEstablishmentTypes, selectedDietTypes, sortBy, pageSize, cursor]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchRestaurants(true);
    }
  }, [fetchRestaurants, loadingMore, hasMore]);

  const refresh = useCallback(() => {
    fetchRestaurants(false);
  }, [fetchRestaurants]);

  useEffect(() => {
    fetchRestaurants(false);
  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, isHighRated, selectedEstablishmentTypes, selectedDietTypes, sortBy]);

  // Handle favorites updates
  useEffect(() => {
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
  }, []);

  return { 
    restaurants, 
    loading, 
    loadingMore, 
    error, 
    hasMore, 
    loadMore, 
    refresh,
    serverTiming
  };
};
