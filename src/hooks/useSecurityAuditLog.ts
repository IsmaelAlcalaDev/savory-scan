
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface SecurityAuditEntry {
  id: string;
  user_id: string | null;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const useSecurityAuditLog = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [auditLogs, setAuditLogs] = useState<SecurityAuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async (limit = 100) => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (
    actionType: string,
    entityType?: string,
    entityId?: string,
    details?: any
  ) => {
    try {
      const { error } = await supabase.rpc('log_security_event', {
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {}
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAuditLogs();
    }
  }, [isAdmin]);

  return {
    auditLogs,
    loading,
    fetchAuditLogs,
    logSecurityEvent
  };
};
