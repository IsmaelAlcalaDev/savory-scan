
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useHomeRpcFeed } from './useFeatureFlags';

interface OptimizedHomeData {
  featuredRestaurants: any[];
  trendingDishes: any[];
  upcomingEvents: any[];
  popularCuisines: any[];
  loading: boolean;
  error: string | null;
}

export const useOptimizedHomeData = () => {
  const [data, setData] = useState<OptimizedHomeData>({
    featuredRestaurants: [],
    trendingDishes: [],
    upcomingEvents: [],
    popularCuisines: [],
    loading: true,
    error: null
  });

  const { enabled: useRpcFeed, loading: flagLoading } = useHomeRpcFeed();

  useEffect(() => {
    if (flagLoading) return;

    const fetchHomeData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        if (useRpcFeed) {
          console.log('Using optimized RPC feed for home data');
          
          // Llamar a la función RPC optimizada cuando esté implementada
          const { data: rpcData, error } = await supabase
            .rpc('get_home_feed_data' as any, { limit_per_section: 10 });

          if (error) {
            console.error('RPC feed error, falling back to individual queries:', error);
            // Fallback a queries individuales si RPC falla
            await fetchIndividualQueries();
          } else {
            setData(prev => ({
              ...prev,
              featuredRestaurants: rpcData?.featured_restaurants || [],
              trendingDishes: rpcData?.trending_dishes || [],
              upcomingEvents: rpcData?.upcoming_events || [],
              popularCuisines: rpcData?.popular_cuisines || [],
              loading: false
            }));
          }
        } else {
          console.log('Using traditional individual queries for home data');
          await fetchIndividualQueries();
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
        setData(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Error loading home data',
          loading: false
        }));
      }
    };

    const fetchIndividualQueries = async () => {
      // Queries paralelas tradicionales para fallback
      const [restaurantsResult, dishesResult, eventsResult, cuisinesResult] = await Promise.allSettled([
        // Featured restaurants
        supabase
          .from('restaurants')
          .select(`
            id, name, slug, description, price_range, google_rating,
            cover_image_url, logo_url, favorites_count,
            establishment_types!inner(name),
            restaurant_cuisines!inner(cuisine_types!inner(name))
          `)
          .eq('is_active', true)
          .eq('is_published', true)
          .is('deleted_at', null)
          .gte('google_rating', 4.0)
          .order('favorites_count', { ascending: false })
          .limit(8),

        // Trending dishes
        supabase
          .from('dishes')
          .select(`
            id, name, description, base_price, image_url,
            favorites_count, is_featured,
            restaurants!inner(id, name, slug)
          `)
          .eq('is_active', true)
          .is('deleted_at', null)
          .eq('restaurants.is_active', true)
          .eq('restaurants.is_published', true)
          .order('favorites_count', { ascending: false })
          .limit(12),

        // Upcoming events
        supabase
          .from('events')
          .select(`
            id, name, description, event_date, start_time,
            image_url, restaurant_id,
            restaurants!inner(name, slug)
          `)
          .eq('is_active', true)
          .is('deleted_at', null)
          .eq('restaurants.is_active', true)
          .gte('event_date', new Date().toISOString().split('T')[0])
          .order('event_date', { ascending: true })
          .limit(6),

        // Popular cuisines
        supabase
          .from('cuisine_types')
          .select('id, name, slug, icon, icon_url')
          .limit(8)
      ]);

      setData(prev => ({
        ...prev,
        featuredRestaurants: restaurantsResult.status === 'fulfilled' ? restaurantsResult.value.data || [] : [],
        trendingDishes: dishesResult.status === 'fulfilled' ? dishesResult.value.data || [] : [],
        upcomingEvents: eventsResult.status === 'fulfilled' ? eventsResult.value.data || [] : [],
        popularCuisines: cuisinesResult.status === 'fulfilled' ? cuisinesResult.value.data || [] : [],
        loading: false
      }));
    };

    fetchHomeData();
  }, [useRpcFeed, flagLoading]);

  return data;
};
