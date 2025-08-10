
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, User, Calendar } from 'lucide-react';
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
      // Since the security audit log function is not available yet, 
      // we'll show a placeholder state
      console.log('Security audit log requested - infrastructure not yet available');
      setAuditLogs([]);
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
      case 'admin_action_attempt':
      case 'admin_action_success':
        return 'bg-blue-500';
      case 'role_change':
        return 'bg-orange-500';
      case 'security_violation':
      case 'admin_action_error':
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
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Security audit logging infrastructure is being set up.</p>
            <p className="text-sm mt-2">Audit logs will be available once the backend functions are deployed.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
