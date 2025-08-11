
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
      const { error } = await supabase.rpc('log_security_event', {
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {}
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
