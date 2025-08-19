
export interface DishVariant {
  id: number;
  dish_id: number;
  name: string;
  price: number;
  is_default: boolean;
  display_order: number;
  created_at: string;
}

export interface Dish {
  id: number;
  restaurant_id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  image_alt?: string;
  category_id: number;
  section_id: number;
  allergens?: string[] | null;
  diet_types?: string[] | null;
  custom_tags?: string[] | null;
  spice_level?: number;
  preparation_time_minutes?: number;
  is_active: boolean;
  is_featured: boolean;
  is_healthy: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  favorites_count: number;
  favorites_count_week: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  
  // Relations
  dish_categories?: { name: string };
  menu_sections?: { name: string };
  dish_variants?: DishVariant[];
  variants?: DishVariant[]; // Alias for compatibility
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
  deleted_at?: string | null;
  dishes?: Dish[];
}
