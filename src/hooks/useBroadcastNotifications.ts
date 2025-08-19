
import { useEffect, useRef } from 'react';
import { broadcastManager } from '@/services/broadcastManager';
import { toast } from '@/hooks/use-toast';

export const useBroadcastNotifications = () => {
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    console.log('useBroadcastNotifications: Setting up broadcast notifications');

    // Setup broadcast channel for general notifications
    broadcastManager.setupBroadcastChannel({
      name: 'general-notifications',
      events: [
        'system_notification',
        'maintenance_alert',
        'feature_announcement'
      ],
      handler: (event) => {
        console.log('Broadcast notification received:', event);
        
        switch (event.type) {
          case 'system_notification':
            toast({
              title: event.payload.title || 'Notificación del sistema',
              description: event.payload.message,
              variant: event.payload.variant || 'default'
            });
            break;
            
          case 'maintenance_alert':
            toast({
              title: 'Mantenimiento programado',
              description: event.payload.message,
              variant: 'destructive'
            });
            break;
            
          case 'feature_announcement':
            toast({
              title: '¡Nueva funcionalidad!',
              description: event.payload.message,
              variant: 'default'
            });
            break;
        }
      }
    });

    return () => {
      console.log('useBroadcastNotifications: Cleaning up');
      broadcastManager.removeBroadcastChannel('general-notifications');
      isSetupRef.current = false;
    };
  }, []);

  // Helper functions to send broadcasts
  const broadcastSystemNotification = (title: string, message: string, variant?: 'default' | 'destructive') => {
    broadcastManager.sendBroadcast('general-notifications', 'system_notification', {
      title,
      message,
      variant
    });
  };

  const broadcastMaintenanceAlert = (message: string) => {
    broadcastManager.sendBroadcast('general-notifications', 'maintenance_alert', {
      message
    });
  };

  const broadcastFeatureAnnouncement = (message: string) => {
    broadcastManager.sendBroadcast('general-notifications', 'feature_announcement', {
      message
    });
  };

  return {
    broadcastSystemNotification,
    broadcastMaintenanceAlert,
    broadcastFeatureAnnouncement
  };
};
