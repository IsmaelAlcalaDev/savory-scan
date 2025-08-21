import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsOverview {
  pageVisits: number;
  pageVisitsChange: number;
  uniqueUsers: number;
  uniqueUsersChange: number;
  searches: number;
  searchesChange: number;
  favorites: number;
  favoritesChange: number;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  sessions: any[];
  topRestaurants: any[];
  topCuisines: any[];
  topLocations: any[];
  deviceActivity: any[];
  recentActivity: any[];
}

export const useAnalyticsData = () => {
  return useQuery({
    queryKey: ['analytics-data'],
    queryFn: async (): Promise<AnalyticsData> => {
      // Get analytics data from existing tables
      const { data: pageVisits, error: pageVisitsError } = await supabase
        .from('page_visits')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: interactions, error: interactionsError } = await supabase
        .from('user_interactions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: favorites, error: favoritesError } = await supabase
        .from('favorites_analytics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (pageVisitsError) console.error('Error fetching page visits:', pageVisitsError);
      if (interactionsError) console.error('Error fetching interactions:', interactionsError);
      if (favoritesError) console.error('Error fetching favorites:', favoritesError);

      // Get search analytics
      const { data: searchAnalytics, error: searchError } = await supabase
        .from('search_analytics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (searchError) {
        console.error('Error fetching search analytics:', searchError);
      }

      // Get recent activity
      const { data: recentActivity, error: recentError } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (recentError) {
        console.error('Error fetching recent activity:', recentError);
      }

      // Process overview data
      const overview: AnalyticsOverview = {
        pageVisits: pageVisits?.length || 0,
        pageVisitsChange: Math.floor(Math.random() * 20), // Mock change data
        uniqueUsers: new Set(pageVisits?.map(pv => pv.user_id).filter(Boolean)).size || 0,
        uniqueUsersChange: Math.floor(Math.random() * 15),
        searches: searchAnalytics?.length || 0,
        searchesChange: Math.floor(Math.random() * 25),
        favorites: favorites?.length || 0,
        favoritesChange: Math.floor(Math.random() * 10),
      };

      return {
        overview,
        sessions: [],
        topRestaurants: [],
        topCuisines: [],
        topLocations: [],
        deviceActivity: [],
        recentActivity: recentActivity || []
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time data
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};

export const useRealtimeMetrics = () => {
  return useQuery({
    queryKey: ['realtime-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (error) throw error;

      return {
        last5Minutes: data?.length || 0,
        events: data || []
      };
    },
    refetchInterval: 5000, // Update every 5 seconds
  });
};