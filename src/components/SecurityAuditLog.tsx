
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action_type: string;
  entity_type?: string;
  entity_id?: string;
  details: any;
  created_at: string;
}

export default function SecurityAuditLog() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchAuditLogs = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      // Use raw SQL query to access the security_audit_log table
      const { data, error } = await supabase.rpc('get_security_audit_log', {
        limit_count: 50
      });
      
      if (error) {
        console.error('Error fetching audit logs:', error);
        // Fallback to empty array if function doesn't exist yet
        setAuditLogs([]);
        return;
      }
      
      let filteredData = data || [];
      if (filter !== 'all') {
        filteredData = filteredData.filter((log: AuditLogEntry) => log.action_type === filter);
      }
      
      setAuditLogs(filteredData);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filter, isAdmin]);

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Access denied. Only administrators can view security audit logs.
        </AlertDescription>
      </Alert>
    );
  }

  const getActionBadgeColor = (actionType: string) => {
    switch (actionType) {
      case 'admin_action':
        return 'bg-blue-500';
      case 'role_change':
        return 'bg-orange-500';
      case 'security_violation':
        return 'bg-red-500';
      case 'login':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-gradient-card border-glass shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Audit Log
        </CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'admin_action' ? 'default' : 'outline'}
            onClick={() => setFilter('admin_action')}
          >
            Admin Actions
          </Button>
          <Button
            size="sm"
            variant={filter === 'role_change' ? 'default' : 'outline'}
            onClick={() => setFilter('role_change')}
          >
            Role Changes
          </Button>
          <Button
            size="sm"
            variant={filter === 'security_violation' ? 'default' : 'outline'}
            onClick={() => setFilter('security_violation')}
          >
            Security Events
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading audit logs...</div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No audit log entries found for the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="border border-glass rounded-lg p-4 bg-background/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        className={`${getActionBadgeColor(log.action_type)} text-white`}
                      >
                        {log.action_type}
                      </Badge>
                      {log.entity_type && (
                        <Badge variant="outline">
                          {log.entity_type}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>User: {log.user_id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      {log.entity_id && (
                        <div>
                          <span className="font-medium">Entity ID:</span> {log.entity_id}
                        </div>
                      )}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div>
                          <span className="font-medium">Details:</span>
                          <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
