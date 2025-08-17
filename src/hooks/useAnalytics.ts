
import { useCallback } from 'react';
import { analytics } from '@/services/analyticsManager';

export const useAnalytics = () => {
  const trackSearch = useCallback((query: string, filters?: Record<string, any>) => {
    analytics.trackSearch(query, filters);
  }, []);

  const trackFilterToggle = useCallback((filterType: string, filterValue: string, isActive: boolean) => {
    analytics.trackFilterToggle(filterType, filterValue, isActive);
  }, []);

  const trackCardClick = useCallback((type: 'restaurant' | 'dish', id: number) => {
    analytics.trackCardClick(type, id);
  }, []);

  const trackActionClick = useCallback((action: 'call' | 'directions' | 'menu', restaurantId?: number) => {
    analytics.trackActionClick(action, restaurantId);
  }, []);

  const trackFavorite = useCallback((action: 'add' | 'remove', type: 'restaurant' | 'dish', id: number) => {
    analytics.trackFavorite(action, type, id);
  }, []);

  const trackFeedImpression = useCallback((restaurantIds: number[]) => {
    analytics.trackFeedImpression(restaurantIds);
  }, []);

  const track = useCallback((eventType: string, eventData?: {
    event_name?: string;
    restaurant_id?: number;
    dish_id?: number;
    event_value?: Record<string, any>;
  }) => {
    analytics.track(eventType, eventData);
  }, []);

  return {
    trackSearch,
    trackFilterToggle,
    trackCardClick,
    trackActionClick,
    trackFavorite,
    trackFeedImpression,
    track
  };
};
