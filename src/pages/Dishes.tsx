
import React, { useState } from 'react';
import FoodieSpotLayout from '@/components/FoodieSpotLayout';
import DishesGrid from '@/components/DishesGrid';
import { useIntelligentDishes } from '@/hooks/useIntelligentDishes';

export default function Dishes() {
  const [searchQuery, setSearchQuery] = useState('');
  const { dishes, loading, error } = useIntelligentDishes({
    searchQuery,
    limit: 20
  });

  return (
    <FoodieSpotLayout
      title="Platos - FoodieSpot"
      description="Descubre los mejores platos de la ciudad"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Platos</h1>
            <p className="text-muted-foreground">
              Explora una amplia variedad de platos deliciosos
            </p>
          </div>
          
          {dishes && dishes.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {dishes.length} platos encontrados
            </div>
          )}
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg">
            Error al cargar los platos: {error}
          </div>
        )}

        <DishesGrid dishes={dishes || []} loading={loading} />

        {!loading && (!dishes || dishes.length === 0) && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No se encontraron platos
            </p>
          </div>
        )}
      </div>
    </FoodieSpotLayout>
  );
}
