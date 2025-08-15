
export interface DietType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  category: 'vegetarian' | 'vegan' | 'gluten_free' | 'healthy';
  min_percentage: number;
  max_percentage: number;
}

export interface DietCategory {
  category: string;
  displayName: string;
  options: DietType[];
}
