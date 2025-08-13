
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { FilterState, FilterValidation, FilterConflict } from '@/types/filters';

interface FilterContextType {
  filters: FilterState;
  validation: FilterValidation;
  updateFilter: (key: keyof FilterState, value: any) => void;
  clearAllFilters: () => void;
  resolveConflicts: () => void;
  validateFilters: () => FilterValidation;
}

const initialFilterState: FilterState = {
  location: "Bormujos, Sevilla, España",
  distance: "sin_limite",
  budget: [],
  rating: 0,
  mainCuisine: null,
  dietaryRestrictions: [],
  timeSlot: null,
  venueTypes: [],
  services: [],
  quickFilters: {
    nearMe: false,
    open: false,
    economical: false,
    topRated: false
  }
};

const initialValidation: FilterValidation = {
  isValid: true,
  conflicts: [],
  hasConflicts: false,
  hasErrors: false,
  hasWarnings: false
};

type FilterAction = 
  | { type: 'UPDATE_FILTER'; key: keyof FilterState; value: any }
  | { type: 'CLEAR_ALL' }
  | { type: 'RESOLVE_CONFLICTS' }
  | { type: 'UPDATE_VALIDATION'; validation: FilterValidation };

interface FilterContextState {
  filters: FilterState;
  validation: FilterValidation;
}

function filterReducer(state: FilterContextState, action: FilterAction): FilterContextState {
  switch (action.type) {
    case 'UPDATE_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.key]: action.value
        }
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        filters: initialFilterState,
        validation: initialValidation
      };
    case 'RESOLVE_CONFLICTS':
      return {
        ...state,
        filters: resolveFilterConflicts(state.filters)
      };
    case 'UPDATE_VALIDATION':
      return {
        ...state,
        validation: action.validation
      };
    default:
      return state;
  }
}

function resolveFilterConflicts(filters: FilterState): FilterState {
  let resolved = { ...filters };

  // If nearMe is active, set distance to very close
  if (resolved.quickFilters.nearMe) {
    resolved.distance = "muy_cerca";
  }

  // If economical is active, limit budget to € and €€
  if (resolved.quickFilters.economical) {
    resolved.budget = resolved.budget.filter(b => b <= 2);
    if (resolved.budget.length === 0) {
      resolved.budget = [1, 2];
    }
  }

  // If topRated is active, set minimum rating to 4.5
  if (resolved.quickFilters.topRated) {
    resolved.rating = Math.max(resolved.rating, 4.5);
  }

  return resolved;
}

function validateFilterState(filters: FilterState): FilterValidation {
  const conflicts: FilterConflict[] = [];

  // Check for conflicts
  if (filters.quickFilters.nearMe && filters.distance !== "muy_cerca") {
    conflicts.push({
      type: 'override',
      affectedFilter: 'distance',
      conflictingFilter: 'nearMe',
      message: 'La distancia se ajustó automáticamente por el filtro "Cerca de mí"'
    });
  }

  if (filters.quickFilters.economical && filters.budget.some(b => b > 2)) {
    conflicts.push({
      type: 'override',
      affectedFilter: 'budget',
      conflictingFilter: 'economical',
      message: 'Los rangos de precio altos fueron desactivados por el filtro "Económico"'
    });
  }

  if (filters.quickFilters.topRated && filters.rating < 4.5) {
    conflicts.push({
      type: 'override',
      affectedFilter: 'rating',
      conflictingFilter: 'topRated',
      message: 'La valoración mínima se ajustó por el filtro "Top Rated"'
    });
  }

  return {
    isValid: conflicts.length === 0 || conflicts.every(c => c.type !== 'disable'),
    conflicts,
    hasConflicts: conflicts.length > 0,
    hasErrors: conflicts.some(c => c.type === 'disable'),
    hasWarnings: conflicts.some(c => c.type === 'warning' || c.type === 'override')
  };
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(filterReducer, {
    filters: initialFilterState,
    validation: initialValidation
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    dispatch({ type: 'UPDATE_FILTER', key, value });
    
    // Auto-resolve conflicts and validate
    const newFilters = { ...state.filters, [key]: value };
    const resolved = resolveFilterConflicts(newFilters);
    const validation = validateFilterState(resolved);
    
    if (JSON.stringify(resolved) !== JSON.stringify(newFilters)) {
      dispatch({ type: 'RESOLVE_CONFLICTS' });
    }
    
    dispatch({ type: 'UPDATE_VALIDATION', validation });
  };

  const clearAllFilters = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const resolveConflicts = () => {
    dispatch({ type: 'RESOLVE_CONFLICTS' });
    const validation = validateFilterState(state.filters);
    dispatch({ type: 'UPDATE_VALIDATION', validation });
  };

  const validateFilters = () => {
    const validation = validateFilterState(state.filters);
    dispatch({ type: 'UPDATE_VALIDATION', validation });
    return validation;
  };

  return (
    <FilterContext.Provider value={{
      filters: state.filters,
      validation: state.validation,
      updateFilter,
      clearAllFilters,
      resolveConflicts,
      validateFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
