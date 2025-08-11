
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

export const useSecureNotifications = () => {
  const { isAdmin } = useUserRole();
  const [creating, setCreating] = useState(false);

  const createNotification = async (
    targetUserId: string,
    title: string,
    body: string,
    type: 'info' | 'warning' | 'success' | 'error',
    data?: any
  ) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "Only administrators can create notifications",
        variant: "destructive"
      });
      return false;
    }

    setCreating(true);
    try {
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

      toast({
        title: "Notification created",
        description: "The notification has been sent successfully"
      });
      
      return notification?.id;
    } catch (error) {
      console.error('Error creating notification:', error);
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
