
import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPageView: (pageName: string) => void;
  trackError: (error: string, context?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const trackEvent = useCallback(async (eventName: string, properties?: Record<string, any>) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      await supabase.from('analytics_events').insert({
        event_type: 'user_action',
        event_name: eventName,
        user_id: user?.id,
        properties: properties || {},
        session_id: sessionStorage.getItem('session_id') || 'anonymous'
      });
    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }, [user]);

  const trackPageView = useCallback((pageName: string) => {
    trackEvent('page_view', { page: pageName, timestamp: Date.now() });
  }, [trackEvent]);

  const trackError = useCallback((error: string, context?: Record<string, any>) => {
    trackEvent('error', { error, context });
  }, [trackEvent]);

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView, trackError }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
