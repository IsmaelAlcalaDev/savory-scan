
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/shared/contexts/AuthContext';

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
      // Direct insert into analytics_events instead of using RPC
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: user.id,
          event_type: `security_${actionType}`,
          entity_type: entityType || null,
          entity_id: entityId ? parseInt(entityId) : null,
          properties: details || {}
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
