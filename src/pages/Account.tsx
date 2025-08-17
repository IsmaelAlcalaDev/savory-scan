
import { Helmet } from 'react-helmet-async';

export default function Account() {
  return (
    <>
      <Helmet>
        <title>Mi Cuenta - FoodieSpot</title>
        <meta name="description" content="Gestiona tu cuenta de FoodieSpot" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-8">Mi Cuenta</h1>
            <div className="bg-card rounded-lg border p-6">
              <p className="text-muted-foreground">
                Página de cuenta en desarrollo. Aquí podrás gestionar tu perfil, preferencias y configuración.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
