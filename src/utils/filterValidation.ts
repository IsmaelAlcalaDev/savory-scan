
export interface FilterValidationResult {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
}

export interface FilterState {
  selectedCuisines: number[];
  selectedFoodTypes: number[];
  selectedDistance: number[];
  selectedPriceRanges: string[];
  selectedRating?: number;
  selectedEstablishmentTypes: number[];
  selectedDietTypes: number[];
  selectedSort?: string;
  selectedTimeRanges: number[];
  isOpenNow: boolean;
  userLat?: number;
  userLng?: number;
}

export const validateFilters = (filters: FilterState): FilterValidationResult => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let isValid = true;

  // Validate location-dependent filters
  if (filters.selectedDistance.length > 0 && (!filters.userLat || !filters.userLng)) {
    warnings.push('Los filtros de distancia requieren activar la ubicación');
    suggestions.push('Activa tu ubicación para usar filtros de distancia');
    isValid = false;
  }

  // Validate price range conflicts
  if (filters.selectedPriceRanges.length > 1) {
    const hasConflict = filters.selectedPriceRanges.some((range1, i) => 
      filters.selectedPriceRanges.some((range2, j) => 
        i !== j && areConflictingPriceRanges(range1, range2)
      )
    );
    if (hasConflict) {
      warnings.push('Algunos rangos de precio seleccionados pueden ser contradictorios');
      suggestions.push('Selecciona rangos de precio que no se solapen');
    }
  }

  // Validate rating with price coherence
  if (filters.selectedRating && filters.selectedRating >= 4.5 && 
      filters.selectedPriceRanges.includes('€')) {
    warnings.push('Combinación poco común: valoración muy alta con precio económico');
    suggestions.push('Considera ampliar el rango de precios para obtener más resultados');
  }

  // Validate time filters coherence
  if (filters.isOpenNow && filters.selectedTimeRanges.length > 0) {
    warnings.push('Los filtros "Abierto ahora" y rangos horarios pueden ser redundantes');
    suggestions.push('Usa solo "Abierto ahora" para resultados más amplios');
  }

  // Validate diet types for restaurants vs dishes
  if (filters.selectedDietTypes.length > 3) {
    warnings.push('Muchos filtros de dieta pueden limitar demasiado los resultados');
    suggestions.push('Prueba con menos filtros de dieta para obtener más opciones');
  }

  return { isValid, warnings, suggestions };
};

const areConflictingPriceRanges = (range1: string, range2: string): boolean => {
  const priceHierarchy = ['€', '€€', '€€€', '€€€€'];
  const index1 = priceHierarchy.indexOf(range1);
  const index2 = priceHierarchy.indexOf(range2);
  return Math.abs(index1 - index2) > 2; // More than 2 levels apart
};

export const getFilterSuggestions = (filters: FilterState, resultCount: number): string[] => {
  const suggestions: string[] = [];

  if (resultCount === 0) {
    suggestions.push('Intenta reducir algunos filtros para obtener más resultados');
    
    if (filters.selectedRating && filters.selectedRating > 4.0) {
      suggestions.push('Reduce el filtro de valoración mínima');
    }
    
    if (filters.selectedDistance.length > 0) {
      suggestions.push('Aumenta el rango de distancia');
    }
    
    if (filters.selectedDietTypes.length > 2) {
      suggestions.push('Reduce los filtros de tipo de dieta');
    }
  } else if (resultCount < 5) {
    suggestions.push('Pocos resultados encontrados, considera ampliar algunos filtros');
  }

  return suggestions;
};
