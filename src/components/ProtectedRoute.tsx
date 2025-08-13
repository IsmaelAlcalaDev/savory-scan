
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'user';
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, hasRole } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && requireAuth && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, requireAuth, navigate]);

  if (authLoading || (user && roleLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect to auth
  }

  if (user && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Required role: {requiredRole}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
