
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminSettings = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Configuración general de la plataforma</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuración del Sistema</CardTitle>
            <CardDescription>Próximamente disponible</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Funcionalidad en desarrollo...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
