
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RestaurantMenu = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gestión de Menú</h1>
          <p className="text-muted-foreground">Administra tu menú y platos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tu Menú</CardTitle>
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

export default RestaurantMenu;
