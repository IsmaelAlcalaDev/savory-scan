
import { useMemo } from 'react';

interface FilterConflict {
  type: 'warning' | 'error';
  message: string;
  conflictingFilters: string[];
}

interface FilterValidationProps {
  selectedCuisines: number[];
  selectedDietTypes: string[];
  selectedPriceRanges: string[];
  selectedEstablishments?: number[];
}

export const useFilterValidation = ({
  selectedCuisines,
  selectedDietTypes,
  selectedPriceRanges,
  selectedEstablishments = []
}: FilterValidationProps) => {
  
  const conflicts = useMemo((): FilterConflict[] => {
    const detectedConflicts: FilterConflict[] = [];

    // Define cuisine types that might conflict with certain diets
    const meatHeavyCuisines = [1, 2, 3]; // Replace with actual IDs
    const seafoodCuisines = [4, 5]; // Replace with actual IDs
    
    // Vegan diet conflicts
    if (selectedDietTypes.includes('vegan')) {
      const conflictingCuisines = selectedCuisines.filter(id => 
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
    if (selectedDietTypes.includes('vegetarian')) {
      const conflictingCuisines = selectedCuisines.filter(id => 
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
    if (selectedPriceRanges.includes('budget') && selectedPriceRanges.includes('premium')) {
      detectedConflicts.push({
        type: 'warning',
        message: 'Has seleccionado rangos de precio contradictorios (económico y premium)',
        conflictingFilters: ['price-budget', 'price-premium']
      });
    }

    // Gluten-free with certain cuisines
    if (selectedDietTypes.includes('gluten-free')) {
      const glutenHeavyCuisines = [6, 7]; // Replace with actual IDs for pasta, pizza, etc.
      const conflictingCuisines = selectedCuisines.filter(id => 
        glutenHeavyCuisines.includes(id)
      );
      
      if (conflictingCuisines.length > 0) {
        detectedConflicts.push({
          type: 'warning',
          message: 'Algunos tipos de cocina seleccionados pueden tener opciones limitadas sin gluten',
          conflictingFilters: ['cuisine', 'diet-gluten-free']
        });
      }
    }

    return detectedConflicts;
  }, [selectedCuisines, selectedDietTypes, selectedPriceRanges, selectedEstablishments]);

  const hasConflicts = conflicts.length > 0;
  const hasErrors = conflicts.some(c => c.type === 'error');
  const hasWarnings = conflicts.some(c => c.type === 'warning');

  return {
    conflicts,
    hasConflicts,
    hasErrors,
    hasWarnings,
    isValid: !hasErrors
  };
};
