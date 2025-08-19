
import React from 'react';
import FoodieSpotLayout from '@/components/FoodieSpotLayout';
import UnifiedRestaurantsGrid from '@/components/UnifiedRestaurantsGrid';

export default function Restaurants() {
  return (
    <FoodieSpotLayout
      title="Restaurantes - FoodieSpot"
      description="Descubre los mejores restaurantes cerca de ti"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Restaurantes</h1>
            <p className="text-muted-foreground">
              Encuentra y explora los mejores restaurantes
            </p>
          </div>
        </div>

        <UnifiedRestaurantsGrid />
      </div>
    </FoodieSpotLayout>
  );
}
