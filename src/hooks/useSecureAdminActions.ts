
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecurityAuditLog } from '@/hooks/useSecurityAuditLog';
import { useUserRole } from '@/hooks/useUserRole';

export const useSecureAdminActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logSecurityEvent } = useSecurityAuditLog();
  const { isAdmin } = useUserRole();

  const executeSecureAction = async (
    actionName: string,
    action: () => Promise<any>,
    entityType?: string,
    entityId?: string
  ) => {
    // Ensure user is admin before allowing any action
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only administrators can perform this action.",
      });
      await logSecurityEvent('unauthorized_admin_action_attempt', entityType, entityId, {
        action: actionName,
        reason: 'not_admin'
      });
      throw new Error('Unauthorized: Admin access required');
    }

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
        // Now properly secured with RLS
        const { data, error } = await supabase
          .from('restaurants')
          .select(`
            id,
            name,
            google_rating,
            google_rating_count,
            favorites_count
          `)
          .eq('is_active', true)
          .eq('is_published', true)
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
        // Now properly secured - only admins can view all user roles
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

  return {
    loading,
    executeSecureAction,
    logSecurityEvent,
    getRestaurantStats,
    getUserRoles,
    isAuthorized: isAdmin
  };
};
