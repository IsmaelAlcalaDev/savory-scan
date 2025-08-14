
import React from 'react';

interface RestaurantListProps {
  searchQuery: string;
  activeTab: 'restaurants' | 'dishes';
  selectedCuisines: number[];
  selectedFoodTypes: number[];
  selectedPriceRanges: string[];
  selectedRating?: number;
  selectedEstablishmentTypes: number[];
  selectedDietTypes: number[];
  selectedSort: string;
}

export default function RestaurantList({
  searchQuery,
  activeTab,
  selectedCuisines,
  selectedFoodTypes,
  selectedPriceRanges,
  selectedRating,
  selectedEstablishmentTypes,
  selectedDietTypes,
  selectedSort,
}: RestaurantListProps) {
  return (
    <div className="mt-6">
      <div className="text-center py-8">
        <p className="text-gray-500">
          Lista de {activeTab === 'restaurants' ? 'restaurantes' : 'platos'} próximamente disponible
        </p>
        {searchQuery && (
          <p className="text-sm text-gray-400 mt-2">
            Búsqueda: "{searchQuery}"
          </p>
        )}
      </div>
    </div>
  );
}
