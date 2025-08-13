
export interface FilterState {
  // Basic filters
  location: string;
  distance: "sin_limite" | "muy_cerca" | "caminando" | "bicicleta" | "transporte" | "coche";
  budget: number[]; // Array of selected price levels (1-4)
  rating: number; // Minimum stars
  
  // Main cuisine (single selection as main filter)
  mainCuisine: string | null;
  
  // Dietary restrictions (can be multiple)
  dietaryRestrictions: string[];
  
  // Time availability
  timeSlot: "desayuno" | "almuerzo" | "merienda" | "cena" | "noche" | null;
  
  // Venue types (can be multiple)
  venueTypes: number[];
  
  // Services (can be multiple)
  services: number[];
  
  // Quick filters (special states)
  quickFilters: {
    nearMe: boolean;
    open: boolean;
    economical: boolean;
    topRated: boolean;
  };
}

export interface FilterConflict {
  type: 'override' | 'disable' | 'warning';
  affectedFilter: keyof FilterState;
  conflictingFilter: string;
  message: string;
}

export interface FilterValidation {
  isValid: boolean;
  conflicts: FilterConflict[];
  hasConflicts: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
}

export interface FilterPriority {
  order: (keyof FilterState)[];
  conflicts: Record<string, (filters: FilterState) => FilterState>;
}

export const FilterStates = {
  INACTIVE: 'inactive',
  ACTIVE: 'active', 
  CONFLICT: 'conflict',
  DISABLED: 'disabled'
} as const;

export type FilterStateType = typeof FilterStates[keyof typeof FilterStates];

export const ConflictTypes = {
  OVERRIDE: 'override',
  DISABLE: 'disable', 
  WARNING: 'warning'
} as const;

export type ConflictType = typeof ConflictTypes[keyof typeof ConflictTypes];
