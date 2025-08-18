
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
  // Campos de verificación
  verification_level?: 'basic' | 'standard' | 'premium';
  verification_status?: 'pending' | 'in_review' | 'verified' | 'rejected' | 'disputed' | 'suspended';
  verification_score?: number;
  verification_requested_at?: string;
  verification_completed_at?: string;
  verification_notes?: string;
  verified_by?: string;
  last_verification_update?: string;
}

export interface RestaurantService {
  id: number;
  name: string;
  icon?: string;
  description?: string;
}
