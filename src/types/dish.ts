
export interface Dish {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  image_alt?: string;
  is_featured: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  is_healthy: boolean;
  spice_level: number;
  preparation_time_minutes?: number;
  favorites_count: number;
  category_name?: string;
  allergens: string[];
  custom_tags: string[];
  variants: DishVariant[];
}

export interface DishVariant {
  id: number;
  name: string;
  price: number;
  is_default: boolean;
}

export interface MenuSection {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  dishes: Dish[];
}
