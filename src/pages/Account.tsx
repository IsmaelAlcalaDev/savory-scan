
import React from 'react';
import FoodieSpotLayout from '@/components/FoodieSpotLayout';

export default function Account() {
  return (
    <FoodieSpotLayout
      title="Mi Cuenta - FoodieSpot"
      description="Gestiona tu perfil y preferencias"
      showFilters={false}
      showSearchBar={false}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
              <p className="text-muted-foreground">
                Gestiona tu información de perfil y preferencias de cuenta.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Favoritos</h2>
              <p className="text-muted-foreground">
                Ve y gestiona tus restaurantes y platos favoritos.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Configuración</h2>
              <p className="text-muted-foreground">
                Ajusta tus preferencias de ubicación y notificaciones.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Historial</h2>
              <p className="text-muted-foreground">
                Revisa tu historial de búsquedas y actividad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FoodieSpotLayout>
  );
}
