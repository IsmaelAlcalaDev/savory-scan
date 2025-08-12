
import { useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useSecurityAuditLog } from '@/hooks/useSecurityAuditLog';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { SecurityAlert } from '@/components/SecurityAlert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Activity, Users, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function SecurityDashboard() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { auditLogs, loading: auditLoading, fetchAuditLogs } = useSecurityAuditLog();
  const { events, getSecuritySummary } = useSecurityMonitoring();
  const [summary, setSummary] = useState(getSecuritySummary());

  useEffect(() => {
    setSummary(getSecuritySummary());
  }, [events]);

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SecurityAlert 
          level="high" 
          message="Access Denied" 
          details={["You need administrator privileges to access this dashboard"]}
        />
      </div>
    );
  }

  const handleRefresh = async () => {
    try {
      await fetchAuditLogs();
      setSummary(getSecuritySummary());
      toast.success('Security data refreshed');
    } catch (error) {
      toast.error('Failed to refresh security data');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Security Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage application security</p>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events (24h)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Severity</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.highSeverityEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medium Severity</CardTitle>
              <Shield className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.mediumSeverityEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditLogs.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Security Status */}
        {summary.highSeverityEvents > 0 && (
          <SecurityAlert 
            level="high" 
            message={`${summary.highSeverityEvents} high-severity security events detected in the last 24 hours`}
            details={["Immediate attention required", "Review security logs", "Consider implementing additional security measures"]}
          />
        )}

        {summary.mediumSeverityEvents > 5 && (
          <SecurityAlert 
            level="medium" 
            message={`${summary.mediumSeverityEvents} medium-severity events detected`}
            details={["Monitor for patterns", "Review authentication logs"]}
          />
        )}

        {summary.totalEvents === 0 && (
          <SecurityAlert 
            level="low" 
            message="No security events detected in the last 24 hours"
            details={["System appears to be secure", "Regular monitoring recommended"]}
          />
        )}

        {/* Detailed Tabs */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="analysis">Security Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Real-time security monitoring events</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No recent security events</p>
                ) : (
                  <div className="space-y-3">
                    {events.slice(-10).reverse().map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={event.severity === 'high' ? 'destructive' : event.severity === 'medium' ? 'secondary' : 'outline'}>
                            {event.severity}
                          </Badge>
                          <div>
                            <p className="font-medium">{event.type.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{JSON.stringify(event.details, null, 2).substring(0, 100)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Audit Logs</CardTitle>
                <CardDescription>Comprehensive audit trail of security-related actions</CardDescription>
              </CardHeader>
              <CardContent>
                {auditLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p>Loading audit logs...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No audit logs available</p>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.slice(0, 20).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{log.action_type.replace('security_', '')}</Badge>
                          <div>
                            <p className="font-medium">{log.entity_type || 'System'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">User: {log.user_id?.substring(0, 8)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Analysis</CardTitle>
                <CardDescription>Analysis and recommendations based on security data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Most Common Event Type</h4>
                    <p className="text-lg font-bold text-primary">{summary.mostCommonEvent || 'None'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Security Status</h4>
                    <Badge variant={summary.highSeverityEvents > 0 ? 'destructive' : summary.mediumSeverityEvents > 5 ? 'secondary' : 'default'}>
                      {summary.highSeverityEvents > 0 ? 'Alert' : summary.mediumSeverityEvents > 5 ? 'Warning' : 'Secure'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Security Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Regular security monitoring is active</li>
                    <li>Row-Level Security (RLS) policies are enabled</li>
                    <li>User role-based access control is implemented</li>
                    <li>Audit logging is capturing security events</li>
                    {summary.highSeverityEvents > 0 && (
                      <li className="text-red-600">⚠️ Review and address high-severity events immediately</li>
                    )}
                    {summary.mediumSeverityEvents > 5 && (
                      <li className="text-yellow-600">⚠️ Consider implementing additional authentication measures</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
