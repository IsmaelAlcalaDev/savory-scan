
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminAuth = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acceso de Administrador</CardTitle>
          <CardDescription>Inicia sesión para acceder al panel de administración</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Funcionalidad en desarrollo...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
