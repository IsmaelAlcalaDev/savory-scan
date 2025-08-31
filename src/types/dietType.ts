
export interface DietType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  category: 'vegetarian' | 'vegan' | 'gluten_free' | 'healthy';
}
