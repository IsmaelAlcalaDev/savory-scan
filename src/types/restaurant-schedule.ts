
export interface RestaurantSchedule {
  id: number;
  restaurant_id: number;
  day_of_week: number;
  is_closed: boolean;
  first_opening_time?: string | null;
  first_closing_time?: string | null;
  second_opening_time?: string | null;
  second_closing_time?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  has_split_schedule?: boolean;
  formatted_schedule?: string;
}

export interface CustomTag {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  restaurant_id?: number;
  created_at: string;
  is_active: boolean;
}

export interface CustomTagWithCount {
  tag: string;
  count: number;
}
