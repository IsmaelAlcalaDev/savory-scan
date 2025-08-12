
export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
  google_rating_count?: number;
  distance_km?: number;
  cuisine_types: string[];
  establishment_type?: string;
  services: string[];
  favorites_count: number;
  cover_image_url?: string;
  logo_url?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  // Support for different data structures from different queries
  establishment_types?: {
    name: string;
  };
  restaurant_cuisines?: Array<{
    cuisine_types: {
      name: string;
    };
  }>;
  restaurant_services?: Array<{
    services: {
      name: string;
    };
  }>;
}

export interface RestaurantService {
  id: number;
  name: string;
  icon?: string;
  description?: string;
}
