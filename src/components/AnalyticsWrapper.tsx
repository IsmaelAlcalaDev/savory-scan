
import React, { useEffect } from 'react';
import { analytics } from '@/services/analyticsManager';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

export const AnalyticsWrapper: React.FC<AnalyticsWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Analytics is automatically initialized when imported
    // This component just ensures it's loaded early in the app lifecycle
    console.debug('Analytics system initialized');
  }, []);

  return <>{children}</>;
};
