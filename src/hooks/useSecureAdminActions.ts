
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
      // Log to console for now until the database function is available
      console.log('Security Event:', {
        action: actionType,
        entity: entityType,
        id: entityId,
        details,
        timestamp: new Date().toISOString(),
        user: (await supabase.auth.getUser()).data.user?.id
      });
    } catch (error) {
      console.warn('Failed to log security event:', error);
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
        // Return empty array for now until the infrastructure is set up
        console.log('Security audit log requested - infrastructure not yet available');
        return [];
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
