
import { useState, useMemo } from 'react';
import UnifiedRestaurantsGrid from './UnifiedRestaurantsGrid';
import RestaurantSortSelector from './RestaurantSortSelector';
import FilterTags from './FilterTags';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useRestaurantSort } from '@/hooks/useRestaurantSort';

interface UnifiedRestaurantsTabProps {
  searchQuery?: string;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  maxDistance?: number;
  isOpenNow?: boolean;
}

export default function UnifiedRestaurantsTab(props: UnifiedRestaurantsTabProps) {
  const { userLocation } = useUserPreferences();
  
  // Determinar si hay ubicación disponible
  const hasLocation = Boolean(userLocation?.latitude && userLocation?.longitude);
  
  // Usar el hook de ordenamiento inteligente
  const { selectedSort, handleSortChange, sortOptions } = useRestaurantSort({
    hasLocation,
    premiumCount: 0 // TODO: Obtener el conteo real de restaurantes premium
  });

  // Crear etiquetas de filtro activos
  const filterTags = useMemo(() => {
    const tags = [];
    
    if (props.searchQuery) {
      tags.push({
        id: 'search',
        label: `"${props.searchQuery}"`,
        onRemove: () => {} // TODO: Implementar limpieza de búsqueda
      });
    }

    if (props.isHighRated) {
      tags.push({
        id: 'rating',
        label: 'Bien valorados',
        onRemove: () => {} // TODO: Implementar limpieza de rating
      });
    }

    if (props.isOpenNow) {
      tags.push({
        id: 'open',
        label: 'Abierto ahora',
        onRemove: () => {} // TODO: Implementar limpieza de horario
      });
    }

    // TODO: Añadir más etiquetas según otros filtros activos

    return tags;
  }, [props]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Restaurantes</h2>
        <RestaurantSortSelector
          value={selectedSort as 'distance' | 'rating' | 'favorites'}
          onChange={(value) => handleSortChange(value)}
          hasLocation={hasLocation}
        />
      </div>

      {/* Etiquetas de filtro con ordenación */}
      <FilterTags
        tags={filterTags}
        onClearAll={() => {}} // TODO: Implementar limpieza general
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
        showSort={true}
      />

      <UnifiedRestaurantsGrid
        searchQuery={props.searchQuery}
        userLat={userLocation?.latitude}
        userLng={userLocation?.longitude}
        maxDistance={props.maxDistance}
        cuisineTypeIds={props.cuisineTypeIds}
        priceRanges={props.priceRanges}
        isHighRated={props.isHighRated}
        selectedEstablishmentTypes={props.selectedEstablishmentTypes}
        selectedDietTypes={props.selectedDietTypes}
        isOpenNow={props.isOpenNow}
        sortBy={selectedSort as 'distance' | 'rating' | 'favorites'}
      />
    </div>
  );
}
