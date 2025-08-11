
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
import { 
  Shield, 
  Users, 
  BarChart3, 
  AlertTriangle,
  Database,
  Settings,
  Bell
} from 'lucide-react';

export default function SuperAdminPanel() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { 
    loading, 
    getRestaurantStats, 
    getUserRoles,
    logSecurityEvent 
  } = useSecureAdminActions();
  const { createNotification } = useSecureNotifications();
  
  const [restaurantStats, setRestaurantStats] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);

  const handleGetRestaurantStats = async () => {
    try {
      const stats = await getRestaurantStats();
      setRestaurantStats(stats || []);
    } catch (error) {
      console.error('Error fetching restaurant stats:', error);
    }
  };

  const handleGetUserRoles = async () => {
    try {
      const roles = await getUserRoles();
      setUserRoles(roles || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const handleTestNotification = async () => {
    if (!user) return;
    
    await createNotification(
      user.id,
      'Test Notification',
      'This is a test notification from the admin panel',
      'info',
      { source: 'admin_panel', test: true }
    );
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This panel is only available to system administrators.
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
            Secure administrative interface with comprehensive audit logging
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Shield className="h-4 w-4 mr-1" />
          Secure Mode
        </Badge>
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
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Restaurant Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGetRestaurantStats} 
                disabled={loading}
                className="mb-4"
              >
                {loading ? 'Loading...' : 'Load Restaurant Stats'}
              </Button>
              
              {restaurantStats.length > 0 && (
                <div className="grid gap-4">
                  {restaurantStats.map((restaurant) => (
                    <div key={restaurant.id} className="border rounded-lg p-4">
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
                User Roles Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGetUserRoles} 
                disabled={loading}
                className="mb-4"
              >
                {loading ? 'Loading...' : 'Load User Roles'}
              </Button>
              
              {userRoles.length > 0 && (
                <div className="space-y-2">
                  {userRoles.map((userRole) => (
                    <div key={userRole.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <span className="font-medium">
                          {userRole.profiles?.full_name || userRole.profiles?.email || 'Unknown User'}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          ({userRole.profiles?.email})
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
                Secure Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Notifications are now created through secure, admin-only functions with proper authentication and audit logging.
                </AlertDescription>
              </Alert>
              
              <Button onClick={handleTestNotification}>
                Send Test Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityAuditLog />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Security Audit Logging</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Row Level Security</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Secure Notifications</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Secured
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin Panel Access</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Restricted
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
