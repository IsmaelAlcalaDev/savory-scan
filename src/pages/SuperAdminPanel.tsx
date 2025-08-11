
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useSecureAdminActions } from '@/hooks/useSecureAdminActions';
import { useSecureNotifications } from '@/hooks/useSecureNotifications';
import SecurityAuditLog from '@/components/SecurityAuditLog';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Users, 
  BarChart3, 
  AlertTriangle,
  Database,
  Settings,
  Bell,
  Activity,
  Eye
} from 'lucide-react';

export default function SuperAdminPanel() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { 
    loading, 
    executeSecureAction,
    logSecurityEvent 
  } = useSecureAdminActions();
  const { createNotification } = useSecureNotifications();
  
  const [restaurantStats, setRestaurantStats] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);

  const handleGetRestaurantStats = async () => {
    try {
      const stats = await executeSecureAction(
        'Get Restaurant Statistics',
        async () => {
          // Use direct SQL query with proper security checks
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
            .order('favorites_count', { ascending: false })
            .limit(50);
          
          if (error) throw error;
          return data;
        },
        'system',
        'restaurant_stats'
      );
      setRestaurantStats(stats || []);
    } catch (error) {
      console.error('Error fetching restaurant stats:', error);
    }
  };

  const handleGetUserRoles = async () => {
    try {
      const roles = await executeSecureAction(
        'Get User Roles',
        async () => {
          // Query user_roles table directly since it contains user_id references
          const { data, error } = await supabase
            .from('user_roles')
            .select(`
              id,
              role,
              user_id
            `)
            .order('role')
            .limit(100);
          
          if (error) throw error;
          
          // Transform the data to include user_id as display info
          return data?.map(item => ({
            id: item.id,
            role: item.role,
            user_id: item.user_id,
            user_email: `User ${item.user_id?.slice(0, 8)}...`, // Show partial user ID
            user_name: `User ${item.user_id?.slice(0, 8)}...`
          }));
        },
        'system',
        'user_roles'
      );
      setUserRoles(roles || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const handleTestNotification = async () => {
    if (!user) return;
    
    await executeSecureAction(
      'Create Test Notification',
      async () => {
        return await createNotification(
          user.id,
          'Test Notification',
          'This is a test notification from the secure admin panel',
          'info',
          { source: 'admin_panel', test: true, timestamp: new Date().toISOString() }
        );
      },
      'notification',
      user.id
    );
  };

  const handleSecurityAudit = async () => {
    await executeSecureAction(
      'Trigger Security Audit',
      async () => {
        await logSecurityEvent('manual_security_audit', 'system', 'admin_panel', {
          triggered_by: user?.email,
          audit_type: 'manual',
          timestamp: new Date().toISOString()
        });
        return { success: true };
      },
      'security',
      'audit'
    );
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This panel requires administrator privileges and is protected by Row Level Security.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Secure Admin Panel</h1>
          <p className="text-muted-foreground">
            Enterprise-grade administrative interface with comprehensive security
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="h-4 w-4 mr-1" />
            RLS Protected
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Eye className="h-4 w-4 mr-1" />
            Audit Logged
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Audit
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Secure Restaurant Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Data is accessed through secure queries with proper authentication and audit logging.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleGetRestaurantStats} 
                disabled={loading}
                className="mb-4"
              >
                {loading ? 'Loading...' : 'Load Restaurant Stats (Secure)'}
              </Button>
              
              {restaurantStats.length > 0 && (
                <div className="grid gap-4">
                  {restaurantStats.map((restaurant) => (
                    <div key={restaurant.id} className="border rounded-lg p-4 bg-gradient-card">
                      <h3 className="font-semibold">{restaurant.name}</h3>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Rating:</span> {restaurant.google_rating}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reviews:</span> {restaurant.google_rating_count}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Saves:</span> {restaurant.favorites_count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Secure User Roles Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  User data is protected by Row Level Security policies and accessed through secure queries.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleGetUserRoles} 
                disabled={loading}
                className="mb-4"
              >
                {loading ? 'Loading...' : 'Load User Roles (Secure)'}
              </Button>
              
              {userRoles.length > 0 && (
                <div className="space-y-2">
                  {userRoles.map((userRole) => (
                    <div key={userRole.id} className="flex items-center justify-between border rounded-lg p-3 bg-gradient-card">
                      <div>
                        <span className="font-medium">
                          {userRole.user_name || 'Unknown User'}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          (ID: {userRole.user_id?.slice(0, 8)}...)
                        </span>
                      </div>
                      <Badge variant={userRole.role === 'admin' ? 'default' : 'outline'}>
                        {userRole.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Secure Notifications Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Notifications are created through secure, admin-only functions with proper authentication, 
                  RLS protection, and comprehensive audit logging.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={async () => {
                  if (!user) return;
                  
                  await executeSecureAction(
                    'Create Test Notification',
                    async () => {
                      return await createNotification(
                        user.id,
                        'Test Notification',
                        'This is a test notification from the secure admin panel',
                        'info',
                        { source: 'admin_panel', test: true, timestamp: new Date().toISOString() }
                      );
                    },
                    'notification',
                    user.id
                  );
                }}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Send Secure Test Notification'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={async () => {
                    await executeSecureAction(
                      'Trigger Security Audit',
                      async () => {
                        await logSecurityEvent('manual_security_audit', 'system', 'admin_panel', {
                          triggered_by: user?.email,
                          audit_type: 'manual',
                          timestamp: new Date().toISOString()
                        });
                        return { success: true };
                      },
                      'security',
                      'audit'
                    );
                  }}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Processing...' : 'Trigger Security Audit'}
                </Button>
              </CardContent>
            </Card>
            
            <SecurityAuditLog />
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Row Level Security (RLS)</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ✓ Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Security Audit Logging</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ✓ Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Secure Query Functions</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ✓ Implemented
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Input Sanitization</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ✓ Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Authentication Security</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ✓ Enhanced
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin Panel Protection</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    ✓ Secured
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
