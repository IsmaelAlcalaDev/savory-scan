
export interface CustomTag {
  name: string;
  count: number;
}

export interface AllergenOption {
  name: string;
  slug: string;
  icon?: string;
}

export interface SpiceLevelOption {
  level: number;
  name: string;
  description: string;
}

export const SPICE_LEVEL_OPTIONS: SpiceLevelOption[] = [
  { level: 0, name: 'No picante', description: 'Sin picante' },
  { level: 1, name: 'Poco picante', description: 'Ligeramente picante' },
  { level: 2, name: 'Medio', description: 'Moderadamente picante' },
  { level: 3, name: 'Picante', description: 'Muy picante' },
  { level: 4, name: 'Muy picante', description: 'Extremadamente picante' }
];

export interface DishFilters {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  selectedPriceRanges?: string[];
  selectedFoodTypes?: number[];
  // Filtros dietéticos booleanos
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isHealthy?: boolean;
  // Nuevos filtros
  selectedCustomTags?: string[];
  excludedAllergens?: string[];
  selectedSpiceLevels?: number[];
  sortByPopularity?: boolean;
}
