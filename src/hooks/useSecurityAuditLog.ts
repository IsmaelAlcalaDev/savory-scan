
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
      // Now properly secured with RLS - only admins can view analytics events
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .like('event_type', 'security_%')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching audit logs:', error);
        setAuditLogs([]);
        return;
      }

      // Transform analytics_events to audit log format
      const transformedLogs: SecurityAuditEntry[] = (data || []).map((event: any) => ({
        id: event.id,
        user_id: event.user_id,
        action_type: event.event_type,
        entity_type: event.entity_type,
        entity_id: event.entity_id?.toString(),
        details: event.properties || {},
        ip_address: null,
        user_agent: event.user_agent,
        created_at: event.created_at
      }));

      setAuditLogs(transformedLogs);
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
      // Use the new secure logging function
      const { error } = await supabase.rpc('log_security_event', {
        event_type: actionType,
        entity_type: entityType || null,
        entity_id: entityId || null,
        details: details || {}
      });

      if (error) {
        console.error('Error logging security event:', error);
      }
    } catch (error) {
      console.error('Error in logSecurityEvent:', error);
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
