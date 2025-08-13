
import { useMemo } from 'react';
import { FilterState, FilterPriority } from '@/types/filters';

export const useFilterLogic = () => {
  const filterPriority: FilterPriority = useMemo(() => ({
    order: [
      'quickFilters',
      'location', 
      'distance',
      'mainCuisine',
      'budget',
      'rating',
      'timeSlot',
      'dietaryRestrictions',
      'venueTypes',
      'services'
    ],
    conflicts: {
      nearMe_distance: (filters: FilterState) => {
        if (filters.quickFilters.nearMe) {
          return { ...filters, distance: "muy_cerca" };
        }
        return filters;
      },
      economical_budget: (filters: FilterState) => {
        if (filters.quickFilters.economical) {
          const economicalBudget = filters.budget.filter(b => b <= 2);
          return { 
            ...filters, 
            budget: economicalBudget.length > 0 ? economicalBudget : [1, 2]
          };
        }
        return filters;
      },
      topRated_rating: (filters: FilterState) => {
        if (filters.quickFilters.topRated) {
          return { ...filters, rating: Math.max(filters.rating, 4.5) };
        }
        return filters;
      }
    }
  }), []);

  const applyFilterLogic = (data: any[], filters: FilterState) => {
    // Resolve conflicts first
    let resolvedFilters = filters;
    Object.values(filterPriority.conflicts).forEach(resolver => {
      resolvedFilters = resolver(resolvedFilters);
    });

    return data.filter(item => {
      // Quick filters
      if (resolvedFilters.quickFilters.open && !item.isOpen) {
        return false;
      }

      // Distance filter
      if (resolvedFilters.distance !== "sin_limite" && item.distance_km) {
        const maxDistance = getMaxDistanceKm(resolvedFilters.distance);
        if (item.distance_km > maxDistance) {
          return false;
        }
      }

      // Main cuisine (single selection)
      if (resolvedFilters.mainCuisine && item.cuisine_types) {
        if (!item.cuisine_types.includes(resolvedFilters.mainCuisine)) {
          return false;
        }
      }

      // Budget (OR logic - any matching price level)
      if (resolvedFilters.budget.length > 0 && item.price_range) {
        const priceLevel = getPriceLevel(item.price_range);
        if (!resolvedFilters.budget.includes(priceLevel)) {
          return false;
        }
      }

      // Rating minimum
      if (resolvedFilters.rating > 0 && item.google_rating) {
        if (item.google_rating < resolvedFilters.rating) {
          return false;
        }
      }

      // Dietary restrictions (AND logic - must have all)
      if (resolvedFilters.dietaryRestrictions.length > 0) {
        const itemDietaryOptions = getDietaryOptions(item);
        const hasAllDietary = resolvedFilters.dietaryRestrictions.every(
          diet => itemDietaryOptions.includes(diet)
        );
        if (!hasAllDietary) return false;
      }

      // Venue types (OR logic - any matching type)
      if (resolvedFilters.venueTypes.length > 0 && item.establishment_type_id) {
        if (!resolvedFilters.venueTypes.includes(item.establishment_type_id)) {
          return false;
        }
      }

      // Services (AND logic - must have all)
      if (resolvedFilters.services.length > 0 && item.services) {
        const hasAllServices = resolvedFilters.services.every(
          serviceId => item.services.some((s: any) => s.id === serviceId)
        );
        if (!hasAllServices) return false;
      }

      return true;
    });
  };

  const getMaxDistanceKm = (distance: string): number => {
    const distanceMap: Record<string, number> = {
      'muy_cerca': 1,
      'caminando': 2,
      'bicicleta': 5,
      'transporte': 15,
      'coche': 50,
      'sin_limite': Infinity
    };
    return distanceMap[distance] || Infinity;
  };

  const getPriceLevel = (priceRange: string): number => {
    const priceMap: Record<string, number> = {
      '€': 1,
      '€€': 2,
      '€€€': 3,
      '€€€€': 4
    };
    return priceMap[priceRange] || 1;
  };

  const getDietaryOptions = (item: any): string[] => {
    const options: string[] = [];
    if (item.is_vegetarian) options.push('vegetariano');
    if (item.is_vegan) options.push('vegano');
    if (item.is_gluten_free) options.push('sin_gluten');
    if (item.is_lactose_free) options.push('sin_lactosa');
    if (item.is_healthy) options.push('saludable');
    return options;
  };

  return {
    filterPriority,
    applyFilterLogic
  };
};
