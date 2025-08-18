
import { useState, useEffect } from 'react';

export interface RestaurantSortOption {
  id: string;
  name: string;
  label: string;
  icon?: string;
}

export const restaurantSortOptions: RestaurantSortOption[] = [
  {
    id: 'recommended',
    name: 'Recomendados',
    label: 'Recomendados',
    icon: '⭐'
  },
  {
    id: 'distance',
    name: 'Más cercanos',
    label: 'Distancia',
    icon: '📍'
  },
  {
    id: 'rating',
    name: 'Mejor valorados',
    label: 'Valoración',
    icon: '⭐'
  },
  {
    id: 'popularity',
    name: 'Más populares',
    label: 'Popularidad',
    icon: '🔥'
  }
];

interface UseRestaurantSortProps {
  hasLocation?: boolean;
  premiumCount?: number;
}

export const useRestaurantSort = ({ 
  hasLocation = false, 
  premiumCount = 0 
}: UseRestaurantSortProps = {}) => {
  // Lógica inteligente para el ordenamiento por defecto
  const getDefaultSort = () => {
    if (!hasLocation) return 'popularity';
    if (premiumCount <= 10) return 'distance';
    return 'recommended';
  };

  const [selectedSort, setSelectedSort] = useState<string>(getDefaultSort());

  // Actualizar el sort por defecto cuando cambien las condiciones
  useEffect(() => {
    const newDefaultSort = getDefaultSort();
    if (selectedSort === 'recommended' && newDefaultSort !== 'recommended') {
      setSelectedSort(newDefaultSort);
    }
  }, [hasLocation, premiumCount]);

  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId);
  };

  // Obtener las opciones disponibles según el contexto
  const getAvailableOptions = () => {
    if (!hasLocation) {
      // Sin ubicación, no mostrar opciones basadas en distancia
      return restaurantSortOptions.filter(option => 
        !['recommended', 'distance'].includes(option.id)
      );
    }
    return restaurantSortOptions;
  };

  return {
    selectedSort,
    handleSortChange,
    sortOptions: getAvailableOptions(),
    isIntelligentDefault: selectedSort === getDefaultSort()
  };
};
