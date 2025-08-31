
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SuperAdminSidebar } from '@/components/admin/SuperAdminSidebar';
import { SuperAdminHeader } from '@/components/admin/SuperAdminHeader';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { UserManagement } from '@/components/admin/UserManagement';
import { RestaurantManagement } from '@/components/admin/RestaurantManagement';
import { VerificationPanel } from '@/components/admin/VerificationPanel';
import { AnalyticsPanel } from '@/components/admin/AnalyticsPanel';
import { FinancialPanel } from '@/components/admin/FinancialPanel';
import { GlobalConfig } from '@/components/admin/GlobalConfig';
import { MassUpload } from '@/components/admin/MassUpload';
import { AIMenuExtraction } from '@/components/admin/AIMenuExtraction';
import { SecurityPanel } from '@/components/admin/SecurityPanel';
import { ModerationPanel } from '@/components/admin/ModerationPanel';
import { AuditLogs } from '@/components/admin/AuditLogs';
import { 
  Shield, 
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock hash validation - in development, always allow access
  const [isValidHash, setIsValidHash] = useState(false);
  
  useEffect(() => {
    // Check if we're on the secure hash route or the development route
    const currentPath = window.location.pathname;
    const isSecureRoute = currentPath.includes('a7f8b2e9');
    const isDevelopmentRoute = currentPath === '/superadmin';
    
    // Allow access if it's the secure route with hash or development route
    setIsValidHash(isSecureRoute || isDevelopmentRoute);
  }, []);

  if (!isAdmin || !isValidHash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {!isAdmin 
                  ? "Necesitas permisos de Super Administrador para acceder a este panel."
                  : "Hash de acceso inválido o expirado. Contacta con el administrador del sistema."
                }
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardOverview />;
      case 'users': return <UserManagement />;
      case 'restaurants': return <RestaurantManagement />;
      case 'verification': return <VerificationPanel />;
      case 'analytics': return <AnalyticsPanel />;
      case 'financial': return <FinancialPanel />;
      case 'config': return <GlobalConfig />;
      case 'upload': return <MassUpload />;
      case 'ai-extraction': return <AIMenuExtraction />;
      case 'security': return <SecurityPanel />;
      case 'moderation': return <ModerationPanel />;
      case 'audit': return <AuditLogs />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SuperAdminHeader 
        user={user}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      
      <div className="flex">
        <SuperAdminSidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          collapsed={sidebarCollapsed}
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
                <p className="text-gray-600">Gestión completa del sistema FoodieSpot</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Sistema Operativo
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Hash válido: 23:45:12
                </Badge>
              </div>
            </div>
            
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
