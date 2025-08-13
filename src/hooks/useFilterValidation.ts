
import { useState, useMemo } from 'react';

interface FilterConflict {
  type: 'warning' | 'error';
  message: string;
  conflictingFilters: string[];
}

interface FilterValidationState {
  cuisines: number[];
  dietTypes: string[];
  priceRanges: string[];
  establishments: number[];
}

export const useFilterValidation = () => {
  const [conflicts, setConflicts] = useState<FilterConflict[]>([]);

  const validateFilters = (
    filterType: string,
    newValue: any,
    currentFilters: FilterValidationState
  ) => {
    const detectedConflicts: FilterConflict[] = [];

    // Define cuisine types that might conflict with certain diets
    const meatHeavyCuisines = [1, 2, 3]; // Replace with actual IDs
    const seafoodCuisines = [4, 5]; // Replace with actual IDs
    
    // Get updated filters based on the change
    const updatedFilters = { ...currentFilters };
    if (filterType === 'cuisines') updatedFilters.cuisines = newValue;
    if (filterType === 'dietTypes') updatedFilters.dietTypes = newValue;
    if (filterType === 'priceRanges') updatedFilters.priceRanges = newValue;
    if (filterType === 'establishments') updatedFilters.establishments = newValue;

    // Vegan diet conflicts
    if (updatedFilters.dietTypes.includes('vegan')) {
      const conflictingCuisines = updatedFilters.cuisines.filter(id => 
        meatHeavyCuisines.includes(id) || seafoodCuisines.includes(id)
      );
      
      if (conflictingCuisines.length > 0) {
        detectedConflicts.push({
          type: 'warning',
          message: 'Algunos tipos de cocina seleccionados pueden tener opciones limitadas para dietas veganas',
          conflictingFilters: ['cuisine', 'diet-vegan']
        });
      }
    }

    // Vegetarian diet conflicts
    if (updatedFilters.dietTypes.includes('vegetarian')) {
      const conflictingCuisines = updatedFilters.cuisines.filter(id => 
        meatHeavyCuisines.includes(id)
      );
      
      if (conflictingCuisines.length > 0) {
        detectedConflicts.push({
          type: 'warning',
          message: 'Algunos tipos de cocina seleccionados pueden tener opciones limitadas para dietas vegetarianas',
          conflictingFilters: ['cuisine', 'diet-vegetarian']
        });
      }
    }

    // Price range conflicts
    if (updatedFilters.priceRanges.includes('budget') && updatedFilters.priceRanges.includes('premium')) {
      detectedConflicts.push({
        type: 'warning',
        message: 'Has seleccionado rangos de precio contradictorios (económico y premium)',
        conflictingFilters: ['price-budget', 'price-premium']
      });
    }

    setConflicts(detectedConflicts);
  };

  const hasConflicts = conflicts.length > 0;
  const hasErrors = conflicts.some(c => c.type === 'error');
  const hasWarnings = conflicts.some(c => c.type === 'warning');

  return {
    conflicts,
    hasConflicts,
    hasErrors,
    hasWarnings,
    isValid: !hasErrors,
    validateFilters
  };
};
