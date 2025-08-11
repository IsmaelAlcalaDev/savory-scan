
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
      const { data: notificationId, error } = await supabase.rpc('create_notification', {
        target_user_id: targetUserId,
        notification_title: title,
        notification_body: body,
        notification_type: type,
        notification_data: data || {}
      });

      if (error) throw error;

      toast({
        title: "Notification created",
        description: "The notification has been sent successfully"
      });
      
      return notificationId;
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
