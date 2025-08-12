
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';
import { useSecurityLogger } from '@/hooks/useSecurityLogger';

export const useSecureNotifications = () => {
  const { isAdmin } = useUserRole();
  const [creating, setCreating] = useState(false);
  const { logSecurityEvent } = useSecurityLogger();

  const createNotification = async (
    targetUserId: string,
    title: string,
    body: string,
    type: 'info' | 'warning' | 'success' | 'error',
    data?: any
  ) => {
    if (!isAdmin) {
      await logSecurityEvent('unauthorized_notification_creation_attempt', 'notification', undefined, {
        target_user_id: targetUserId,
        title: title.substring(0, 50), // Truncated for security
        type
      });
      
      toast({
        title: "Unauthorized",
        description: "Only administrators can create notifications",
        variant: "destructive"
      });
      return false;
    }

    setCreating(true);
    try {
      // Log the notification creation attempt
      await logSecurityEvent('notification_creation_attempt', 'notification', undefined, {
        target_user_id: targetUserId,
        type,
        title_length: title.length,
        body_length: body.length
      });

      // Direct insert since we have the proper RLS policies in place
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          title: title,
          body: body,
          type: type as any, // Type assertion for notification_type enum
          data: data || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Log successful creation
      await logSecurityEvent('notification_created', 'notification', notification.id, {
        target_user_id: targetUserId,
        type
      });

      toast({
        title: "Notification created",
        description: "The notification has been sent successfully"
      });
      
      return notification?.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      
      await logSecurityEvent('notification_creation_error', 'notification', undefined, {
        target_user_id: targetUserId,
        error: error instanceof Error ? error.message : 'Unknown error',
        type
      });
      
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive"
      });
      return false;
    } finally {
      setCreating(false);
    }
  };

  return {
    createNotification,
    creating,
    canCreateNotifications: isAdmin
  };
};
