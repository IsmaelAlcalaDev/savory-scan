
import { useState } from 'react';

export interface DishSortOption {
  id: string;
  name: string;
  label: string;
  icon?: string;
}

export const dishSortOptions: DishSortOption[] = [
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
  },
  {
    id: 'price_asc',
    name: 'Precio: menor a mayor',
    label: 'Precio ↑',
    icon: '💰'
  },
  {
    id: 'price_desc',
    name: 'Precio: mayor a menor',
    label: 'Precio ↓',
    icon: '💎'
  }
];

export const useDishSort = () => {
  const [selectedSort, setSelectedSort] = useState<string>('rating');

  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId);
  };

  return {
    selectedSort,
    handleSortChange,
    sortOptions: dishSortOptions
  };
};
