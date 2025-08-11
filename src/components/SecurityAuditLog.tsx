
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, User, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useSecurityAuditLog } from '@/hooks/useSecurityAuditLog';

export default function SecurityAuditLog() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { auditLogs, loading, fetchAuditLogs } = useSecurityAuditLog();
  const [filter, setFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    if (filter === 'all') return true;
    return log.action_type.toLowerCase().includes(filter.toLowerCase());
  });

  const getActionBadgeColor = (actionType: string) => {
    if (actionType.includes('admin') || actionType.includes('security')) {
      return 'bg-red-500';
    }
    if (actionType.includes('login') || actionType.includes('auth')) {
      return 'bg-green-500';
    }
    if (actionType.includes('update') || actionType.includes('change')) {
      return 'bg-orange-500';
    }
    return 'bg-blue-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

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

  return (
    <Card className="bg-gradient-card border-glass shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Audit Log
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'admin' ? 'default' : 'outline'}
            onClick={() => setFilter('admin')}
          >
            Admin Actions
          </Button>
          <Button
            size="sm"
            variant={filter === 'auth' ? 'default' : 'outline'}
            onClick={() => setFilter('auth')}
          >
            Authentication
          </Button>
          <Button
            size="sm"
            variant={filter === 'security' ? 'default' : 'outline'}
            onClick={() => setFilter('security')}
          >
            Security Events
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchAuditLogs()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No audit logs found for the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-3 bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    className={`${getActionBadgeColor(log.action_type)} text-white`}
                  >
                    {log.action_type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(log.created_at)}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm">
                  {log.entity_type && log.entity_id && (
                    <div>
                      <span className="font-medium">Target:</span> {log.entity_type} #{log.entity_id}
                    </div>
                  )}
                  
                  {log.user_id && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="font-medium">User:</span> {log.user_id}
                    </div>
                  )}
                  
                  {log.ip_address && (
                    <div>
                      <span className="font-medium">IP:</span> {log.ip_address}
                    </div>
                  )}
                  
                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium text-muted-foreground">
                        View Details
                      </summary>
                      <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
