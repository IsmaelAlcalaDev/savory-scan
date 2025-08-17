
import { useEffect, useRef, useState } from 'react';
import { broadcastManager } from '@/services/broadcastManager';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface BroadcastNotification {
  id: string;
  type: 'favorite_added' | 'menu_published' | 'promotion_active' | 'event_reminder';
  title: string;
  message: string;
  timestamp: number;
  data?: any;
}

export const useBroadcastNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<BroadcastNotification[]>([]);
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (!user || isSetupRef.current) return;
    isSetupRef.current = true;

    console.log('useBroadcastNotifications: Setting up broadcast notifications');

    // Setup broadcast channel for user-specific notifications
    broadcastManager.setupBroadcastChannel({
      name: `user-notifications-${user.id}`,
      events: [
        'favorite_added',
        'menu_published', 
        'promotion_active',
        'event_reminder'
      ],
      handler: (event) => {
        console.log('Broadcast notification received:', event);
        
        const notification: BroadcastNotification = {
          id: `${event.type}-${event.timestamp}`,
          type: event.type as any,
          title: event.payload.title,
          message: event.payload.message,
          timestamp: event.timestamp,
          data: event.payload.data
        };

        // Add to notifications list
        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10

        // Show toast notification
        toast({
          title: notification.title,
          description: notification.message,
          duration: 5000
        });

        // Handle specific notification types
        handleNotificationType(notification);
      }
    });

    return () => {
      console.log('useBroadcastNotifications: Cleaning up');
      broadcastManager.removeBroadcastChannel(`user-notifications-${user.id}`);
      isSetupRef.current = false;
    };
  }, [user]);

  const handleNotificationType = (notification: BroadcastNotification) => {
    switch (notification.type) {
      case 'favorite_added':
        // Handle restaurant favorited by someone
        console.log('Restaurant favorited by user:', notification.data);
        break;
        
      case 'menu_published':
        // Handle new menu published
        console.log('New menu published:', notification.data);
        break;
        
      case 'promotion_active':
        // Handle promotion activated
        console.log('Promotion activated:', notification.data);
        break;
        
      case 'event_reminder':
        // Handle event reminder
        console.log('Event reminder:', notification.data);
        break;
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  return {
    notifications,
    clearNotifications,
    markAsRead
  };
};
