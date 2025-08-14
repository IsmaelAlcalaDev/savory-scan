
import { useState, useEffect } from 'react';

export interface SortOption {
  id: string;
  name: string;
  display_text: string;
  value: string;
  icon?: string;
}

export const useSortOptions = () => {
  const [sortOptions, setSortOptions] = useState<SortOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Static sort options for now
    const staticSortOptions: SortOption[] = [
      {
        id: 'distance',
        name: 'Distancia',
        display_text: 'Más cerca',
        value: 'distance_asc',
        icon: '📍'
      },
      {
        id: 'rating',
        name: 'Valoración',
        display_text: 'Mejor valorados',
        value: 'rating_desc',
        icon: '⭐'
      },
      {
        id: 'popularity',
        name: 'Popularidad',
        display_text: 'Más populares',
        value: 'popularity_desc',
        icon: '🔥'
      },
      {
        id: 'price_asc',
        name: 'Precio',
        display_text: 'Más económico',
        value: 'price_asc',
        icon: '💰'
      },
      {
        id: 'price_desc',
        name: 'Precio',
        display_text: 'Más caro',
        value: 'price_desc',
        icon: '💎'
      }
    ];

    setSortOptions(staticSortOptions);
  }, []);

  return { sortOptions, loading, error };
};
