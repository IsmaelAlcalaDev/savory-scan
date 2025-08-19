
export interface DishVariant {
  id: number;
  dish_id: number;
  name: string;
  price: number;
  display_order: number;
  is_default: boolean;
  created_at: string;
}

export interface Dish {
  id: number;
  restaurant_id: number;
  category_id: number;
  section_id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  image_alt?: string;
  is_featured: boolean;
  is_active: boolean;
  is_healthy: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  spice_level: number;
  preparation_time_minutes?: number;
  allergens: string[];
  diet_types: string[];
  custom_tags: string[];
  favorites_count: number;
  favorites_count_week: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  variants: DishVariant[];
}

export interface MenuSection {
  id: number;
  restaurant_id: number;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  dishes: Dish[];
}

export type PriceRange = "€" | "€€" | "€€€" | "€€€€";
