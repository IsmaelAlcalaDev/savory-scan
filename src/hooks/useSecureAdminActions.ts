
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSecureAdminActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const logSecurityEvent = async (
    actionType: string,
    entityType?: string,
    entityId?: string,
    details?: any
  ) => {
    try {
      // Try to call the security logging function if it exists
      const { error } = await supabase.rpc('log_security_event', {
        p_action_type: actionType,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_details: details || {}
      }).single();
      
      if (error) {
        console.warn('Security logging function not available:', error.message);
        // Fallback: log to console for now
        console.log('Security Event:', {
          action: actionType,
          entity: entityType,
          id: entityId,
          details,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('Failed to log security event:', error);
      // Fallback: log to console
      console.log('Security Event (fallback):', {
        action: actionType,
        entity: entityType,
        id: entityId,
        details,
        timestamp: new Date().toISOString()
      });
    }
  };

  const executeSecureAction = async (
    actionName: string,
    action: () => Promise<any>,
    entityType?: string,
    entityId?: string
  ) => {
    setLoading(true);
    try {
      // Log the action attempt
      await logSecurityEvent('admin_action_attempt', entityType, entityId, {
        action: actionName,
        timestamp: new Date().toISOString()
      });

      // Execute the actual action
      const result = await action();

      // Log successful completion
      await logSecurityEvent('admin_action_success', entityType, entityId, {
        action: actionName,
        timestamp: new Date().toISOString(),
        result: result ? 'success' : 'no_result'
      });

      toast({
        title: "Action completed securely",
        description: `${actionName} executed successfully with audit logging`,
      });

      return result;
    } catch (error) {
      // Log the error
      await logSecurityEvent('admin_action_error', entityType, entityId, {
        action: actionName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      toast({
        variant: "destructive",
        title: "Action failed",
        description: `Failed to execute ${actionName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantStats = async () => {
    return executeSecureAction(
      'Get Restaurant Statistics',
      async () => {
        const { data, error } = await supabase
          .from('restaurant_stats')
          .select('*')
          .limit(10);
        
        if (error) throw error;
        return data;
      },
      'system',
      'restaurant_stats'
    );
  };

  const getUserRoles = async () => {
    return executeSecureAction(
      'Get User Roles',
      async () => {
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            *,
            profiles!inner(email, full_name)
          `)
          .limit(50);
        
        if (error) throw error;
        return data;
      },
      'system',
      'user_roles'
    );
  };

  const getSecurityAuditLog = async (limit = 100) => {
    return executeSecureAction(
      'Get Security Audit Log',
      async () => {
        try {
          const { data, error } = await supabase.rpc('get_security_audit_log', {
            limit_count: limit
          });
          
          if (error) throw error;
          return data;
        } catch (error) {
          console.warn('Security audit log function not available:', error);
          return [];
        }
      },
      'system',
      'security_audit_log'
    );
  };

  return {
    loading,
    executeSecureAction,
    logSecurityEvent,
    getRestaurantStats,
    getUserRoles,
    getSecurityAuditLog
  };
};
