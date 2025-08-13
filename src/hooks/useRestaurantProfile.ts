
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RestaurantProfile {
  id: number;
  name: string;
  slug: string;
  price_range: string;
  google_rating?: number;
  google_rating_count?: number;
  address: string;
  website?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  cover_image_url?: string;
  social_links?: any;
  delivery_links?: any;
  latitude?: number;
  longitude?: number;
  favorites_count: number;
  favorites_count_week: number;
  favorites_count_month: number;
  establishment_type?: string;
  cuisine_types: string[];
  services: string[];
  schedules: Array<{
    day_of_week: number;
    opening_time: string;
    closing_time: string;
    is_closed: boolean;
  }>;
  gallery: Array<{
    image_url: string;
    alt_text?: string;
    caption?: string;
  }>;
  promotions: Array<{
    id: number;
    title: string;
    description: string;
    discount_type: string;
    discount_value?: number;
    discount_label?: string;
    valid_from: string;
    valid_until: string;
    conditions?: string;
    promo_code?: string;
  }>;
}

export const useRestaurantProfile = (slug: string) => {
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching restaurant profile for slug:', slug);

        // Get basic restaurant data with related info
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select(`
            id,
            name,
            slug,
            price_range,
            google_rating,
            google_rating_count,
            address,
            website,
            phone,
            email,
            logo_url,
            cover_image_url,
            social_links,
            delivery_links,
            latitude,
            longitude,
            favorites_count,
            favorites_count_week,
            favorites_count_month,
            establishment_types!inner(name),
            restaurant_cuisines!inner(
              cuisine_types!inner(name)
            ),
            restaurant_services(
              services!inner(name)
            )
          `)
          .eq('slug', slug)
          .eq('is_active', true)
          .eq('is_published', true)
          .is('deleted_at', null)
          .single();

        if (restaurantError) {
          console.error('Error fetching restaurant:', restaurantError);
          throw restaurantError;
        }

        if (!restaurantData) {
          throw new Error('Restaurante no encontrado');
        }

        console.log('Restaurant data fetched:', restaurantData);

        // Get schedules
        const { data: schedules, error: schedulesError } = await supabase
          .from('restaurant_schedules')
          .select('day_of_week, opening_time, closing_time, is_closed')
          .eq('restaurant_id', restaurantData.id)
          .order('day_of_week');

        if (schedulesError) {
          console.error('Error fetching schedules:', schedulesError);
        }

        console.log('Schedules fetched:', schedules);

        // Get gallery
        const { data: gallery, error: galleryError } = await supabase
          .from('restaurant_gallery')
          .select('image_url, alt_text, caption')
          .eq('restaurant_id', restaurantData.id)
          .order('display_order');

        if (galleryError) {
          console.error('Error fetching gallery:', galleryError);
        }

        console.log('Gallery fetched:', gallery);

        // Get active promotions
        const { data: promotions, error: promotionsError } = await supabase
          .from('promotions')
          .select(`
            id,
            title,
            description,
            discount_type,
            discount_value,
            discount_label,
            valid_from,
            valid_until,
            conditions,
            promo_code
          `)
          .eq('restaurant_id', restaurantData.id)
          .eq('is_active', true)
          .is('deleted_at', null)
          .gte('valid_until', new Date().toISOString())
          .order('valid_from', { ascending: true });

        if (promotionsError) {
          console.error('Error fetching promotions:', promotionsError);
        }

        console.log('Promotions fetched:', promotions);

        const formattedData: RestaurantProfile = {
          id: restaurantData.id,
          name: restaurantData.name,
          slug: restaurantData.slug,
          price_range: restaurantData.price_range,
          google_rating: restaurantData.google_rating,
          google_rating_count: restaurantData.google_rating_count,
          address: restaurantData.address,
          website: restaurantData.website,
          phone: restaurantData.phone,
          email: restaurantData.email,
          logo_url: restaurantData.logo_url,
          cover_image_url: restaurantData.cover_image_url,
          social_links: restaurantData.social_links || {},
          delivery_links: restaurantData.delivery_links || {},
          latitude: restaurantData.latitude,
          longitude: restaurantData.longitude,
          favorites_count: restaurantData.favorites_count || 0,
          favorites_count_week: restaurantData.favorites_count_week || 0,
          favorites_count_month: restaurantData.favorites_count_month || 0,
          establishment_type: restaurantData.establishment_types?.name,
          cuisine_types: restaurantData.restaurant_cuisines?.map((rc: any) => rc.cuisine_types?.name).filter(Boolean) || [],
          services: restaurantData.restaurant_services?.map((rs: any) => rs.services?.name).filter(Boolean) || [],
          schedules: schedules || [],
          gallery: gallery || [],
          promotions: promotions || []
        };

        console.log('Formatted restaurant data:', formattedData);
        setRestaurant(formattedData);
      } catch (err) {
        console.error('Error in fetchRestaurant:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar restaurante');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [slug]);

  return { restaurant, loading, error };
};
