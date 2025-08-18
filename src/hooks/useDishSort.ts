
import { useState, useMemo } from 'react';

interface Dish {
  id: number;
  base_price: number;
  favorites_count?: number;
  restaurant_google_rating?: number;
  is_featured?: boolean;
}

export interface DishSortOption {
  value: string;
  label: string;
  description?: string;
}

interface UseDishSortProps {
  dishes: Dish[];
}

export const useDishSort = ({ dishes }: UseDishSortProps) => {
  const [sortBy, setSortBy] = useState<string>('rating');

  // Opciones de ordenamiento para platos
  const sortOptions: DishSortOption[] = [
    {
      value: 'rating',
      label: 'Mejor valorados',
      description: 'Platos de restaurantes mejor valorados'
    },
    {
      value: 'popular',
      label: 'Más populares',
      description: 'Platos con más favoritos'
    },
    {
      value: 'price_asc',
      label: 'Precio: menor a mayor',
      description: 'Del más barato al más caro'
    },
    {
      value: 'price_desc',
      label: 'Precio: mayor a menor',
      description: 'Del más caro al más barato'
    }
  ];

  // Función para ordenar platos
  const sortedDishes = useMemo(() => {
    if (!dishes.length) return [];

    const sorted = [...dishes].sort((a, b) => {
      // Siempre priorizar platos destacados
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;

      switch (sortBy) {
        case 'rating':
          return (b.restaurant_google_rating || 0) - (a.restaurant_google_rating || 0);

        case 'popular':
          return (b.favorites_count || 0) - (a.favorites_count || 0);

        case 'price_asc':
          return a.base_price - b.base_price;

        case 'price_desc':
          return b.base_price - a.base_price;

        default:
          return 0;
      }
    });

    return sorted;
  }, [dishes, sortBy]);

  return {
    sortBy,
    setSortBy,
    sortOptions,
    sortedDishes
  };
};
