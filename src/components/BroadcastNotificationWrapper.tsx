
import React from 'react';
import { useBroadcastNotifications } from '@/hooks/useBroadcastNotifications';
import { useRestaurantBroadcasts } from '@/hooks/useRestaurantBroadcasts';

interface BroadcastNotificationWrapperProps {
  children: React.ReactNode;
}

export const BroadcastNotificationWrapper: React.FC<BroadcastNotificationWrapperProps> = ({ 
  children 
}) => {
  // Setup broadcast notifications
  useBroadcastNotifications();
  useRestaurantBroadcasts();

  return <>{children}</>;
};
