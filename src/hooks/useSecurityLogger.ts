
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSecurityLogger = () => {
  const { user } = useAuth();

  const logSecurityEvent = async (
    actionType: string,
    entityType?: string,
    entityId?: string,
    details?: any
  ) => {
    if (!user) return;

    try {
      // Use direct table insertion instead of RPC function
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: user.id,
          event_type: `security_${actionType}`,
          entity_type: entityType,
          entity_id: entityId ? parseInt(entityId) : null,
          properties: details || {},
          session_id: `security_${Date.now()}`
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  };

  return { logSecurityEvent };
};
