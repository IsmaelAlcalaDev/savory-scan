
import { useState, useEffect, useMemo } from 'react';
import { useUserPreferences } from './useUserPreferences';

interface Restaurant {
  id: number;
  is_premium?: boolean;
  google_rating?: number;
  favorites_count?: number;
  distance_km?: number;
}

export interface RestaurantSortOption {
  value: string;
  label: string;
  description?: string;
}

interface UseRestaurantSortProps {
  restaurants: Restaurant[];
}

export const useRestaurantSort = ({ restaurants }: UseRestaurantSortProps) => {
  const { userLocation } = useUserPreferences();
  const hasLocation = Boolean(userLocation?.latitude && userLocation?.longitude);
  
  // Determinar ordenamiento por defecto basado en restaurantes premium
  const defaultSort = useMemo(() => {
    if (!restaurants.length) return 'recommended';
    
    const premiumRestaurants = restaurants.filter(r => 
      r.is_premium && r.google_rating && r.google_rating >= 4.0
    );
    
    // Si hay ≤10 restaurantes premium, usar distancia por defecto
    if (premiumRestaurants.length <= 10) {
      return hasLocation ? 'distance' : 'popular';
    }
    
    return 'recommended';
  }, [restaurants, hasLocation]);

  const [sortBy, setSortBy] = useState<string>(defaultSort);

  // Actualizar sort cuando cambie el default
  useEffect(() => {
    setSortBy(defaultSort);
  }, [defaultSort]);

  // Opciones de ordenamiento disponibles
  const sortOptions: RestaurantSortOption[] = useMemo(() => {
    const options: RestaurantSortOption[] = [
      {
        value: 'recommended',
        label: 'Recomendados',
        description: 'Los mejores restaurantes premium con buena valoración'
      }
    ];

    if (hasLocation) {
      options.push({
        value: 'distance',
        label: 'Más cercanos',
        description: 'Ordenados por distancia desde tu ubicación'
      });
    }

    options.push(
      {
        value: 'rating',
        label: 'Mejor valorados',
        description: 'Ordenados por valoración de usuarios'
      },
      {
        value: 'popular',
        label: 'Más populares',
        description: 'Ordenados por número de favoritos'
      }
    );

    return options;
  }, [hasLocation]);

  // Función para ordenar restaurantes
  const sortedRestaurants = useMemo(() => {
    if (!restaurants.length) return [];

    const sorted = [...restaurants].sort((a, b) => {
      switch (sortBy) {
        case 'recommended':
          // Priorizar premium con rating >= 4.0
          const aIsPremium = a.is_premium && (a.google_rating || 0) >= 4.0;
          const bIsPremium = b.is_premium && (b.google_rating || 0) >= 4.0;
          
          if (aIsPremium && !bIsPremium) return -1;
          if (!aIsPremium && bIsPremium) return 1;
          
          // Entre premium, ordenar por rating
          if (aIsPremium && bIsPremium) {
            return (b.google_rating || 0) - (a.google_rating || 0);
          }
          
          // Entre no premium, ordenar por rating también
          return (b.google_rating || 0) - (a.google_rating || 0);

        case 'distance':
          if (a.distance_km === null && b.distance_km === null) return 0;
          if (a.distance_km === null) return 1;
          if (b.distance_km === null) return -1;
          return a.distance_km - b.distance_km;

        case 'rating':
          return (b.google_rating || 0) - (a.google_rating || 0);

        case 'popular':
          return (b.favorites_count || 0) - (a.favorites_count || 0);

        default:
          return 0;
      }
    });

    return sorted;
  }, [restaurants, sortBy]);

  return {
    sortBy,
    setSortBy,
    sortOptions,
    sortedRestaurants,
    defaultSort
  };
};
