
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RestaurantOrders = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona los pedidos de tu restaurante</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos Activos</CardTitle>
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

export default RestaurantOrders;
