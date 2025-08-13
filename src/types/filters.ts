
export interface QuickFilters {
  nearMe: boolean;
  open: boolean;
  economical: boolean;
  topRated: boolean;
}

export interface FilterState {
  // Basic filters
  location: string;
  distance: string;
  budget: number[];
  rating: number;
  
  // Main cuisine (only one active)
  mainCuisine: string | null;
  
  // Dietary restrictions (multiple allowed)
  dietaryRestrictions: string[];
  
  // Time availability
  timeSlot: string | null;
  
  // Venue types (multiple allowed)
  venueTypes: number[];
  
  // Services (multiple allowed)
  services: number[];
  
  // Quick filters (special states)
  quickFilters: QuickFilters;
}

export interface FilterConflict {
  type: 'override' | 'disable' | 'warning';
  affectedFilter: string;
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

export enum FilterState {
  INACTIVE = 'inactive',
  ACTIVE = 'active', 
  CONFLICT = 'conflict',
  DISABLED = 'disabled'
}

export interface FilterPriority {
  order: (keyof FilterState)[];
  conflicts: Record<string, (filters: FilterState) => FilterState>;
}
