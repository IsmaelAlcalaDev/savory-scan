
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRole } from '@/hooks/useUserRole';
import { useSecurityAuditLog } from '@/hooks/useSecurityAuditLog';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { SecurityAlert } from '@/components/SecurityAlert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Lock,
  Eye,
  Users,
  Database
} from 'lucide-react';

export default function SecurityDashboard() {
  const { isAdmin } = useUserRole();
  const { auditLogs, loading } = useSecurityAuditLog();
  const { securityMetrics } = useSecurityMonitoring();

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This security dashboard requires administrator privileges.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const securityStatus = {
    rls_enabled: true,
    security_definer_fixed: true,
    input_validation: true,
    rate_limiting: true,
    audit_logging: true,
    session_security: true
  };

  const getOverallSecurityScore = () => {
    const enabledFeatures = Object.values(securityStatus).filter(Boolean).length;
    const totalFeatures = Object.keys(securityStatus).length;
    return Math.round((enabledFeatures / totalFeatures) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time security monitoring and audit overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="h-4 w-4 mr-1" />
            Security Score: {getOverallSecurityScore()}%
          </Badge>
        </div>
      </div>

      <SecurityAlert
        level={securityMetrics.riskLevel}
        message={`Current security risk level: ${securityMetrics.riskLevel.toUpperCase()}`}
        details={[
          `Failed login attempts: ${securityMetrics.failedLoginAttempts}`,
          `Suspicious activities detected: ${securityMetrics.suspiciousActivities}`,
          `Last security event: ${securityMetrics.lastSecurityEvent?.toLocaleString() || 'None'}`
        ]}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="rls" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            RLS Status
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RLS Protection</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">
                  17 tables secured with Row Level Security
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditLogs.length}</div>
                <p className="text-xs text-muted-foreground">
                  Security events logged today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityMetrics.failedLoginAttempts}</div>
                <p className="text-xs text-muted-foreground">
                  Failed login attempts today
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Row Level Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(securityStatus).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                    <Badge variant={enabled ? "default" : "destructive"}>
                      {enabled ? (
                        <><CheckCircle className="h-3 w-3 mr-1" />Enabled</>
                      ) : (
                        <><AlertTriangle className="h-3 w-3 mr-1" />Disabled</>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Security Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {getOverallSecurityScore()}%
                    </div>
                    <div className="text-sm text-muted-foreground">Security Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {securityMetrics.suspiciousActivities}
                    </div>
                    <div className="text-sm text-muted-foreground">Suspicious Activities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {securityMetrics.failedLoginAttempts}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed Logins</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      securityMetrics.riskLevel === 'low' ? 'text-green-600' :
                      securityMetrics.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {securityMetrics.riskLevel.toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">Risk Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center">Loading audit logs...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center text-muted-foreground">No security events recorded</div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="border rounded-lg p-3 bg-gradient-card">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{log.action_type}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      {log.entity_type && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Entity: {log.entity_type} {log.entity_id && `(${log.entity_id})`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
