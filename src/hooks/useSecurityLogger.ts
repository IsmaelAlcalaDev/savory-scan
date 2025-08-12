
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
      // Use the new secure logging function from the database
      const { error } = await supabase.rpc('log_security_event', {
        event_type: actionType,
        entity_type: entityType || null,
        entity_id: entityId || null,
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
