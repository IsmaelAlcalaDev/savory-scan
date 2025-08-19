
import { supabase } from '@/integrations/supabase/client';

// Consulta simple para verificar si un restaurante específico está abierto
export const isRestaurantOpenNow = async (restaurantId: number): Promise<boolean> => {
  try {
    // Usar la vista optimizada
    const { data, error } = await supabase
      .from('restaurants_open_now')
      .select('is_currently_open')
      .eq('id', restaurantId)
      .single();
    
    if (error) {
      console.error('Error checking if restaurant is open:', error);
      return false;
    }
    
    return data?.is_currently_open || false;
  } catch (error) {
    console.error('Error in isRestaurantOpenNow:', error);
    return false;
  }
};

// Obtener todos los restaurantes abiertos ahora mismo
export const getOpenRestaurantsNow = async () => {
  try {
    const { data, error } = await supabase
      .from('restaurants_open_now')
      .select(`
        id,
        name,
        slug,
        address,
        latitude,
        longitude,
        google_rating,
        price_range,
        cuisine_type_ids,
        establishment_type_id,
        cover_image_url,
        favorites_count
      `)
      .eq('is_currently_open', true);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching open restaurants:', error);
    throw error;
  }
};

// Consulta optimizada usando la vista directamente
export const getOpenRestaurantsWithFilters = async (filters: {
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
}) => {
  try {
    let query = supabase
      .from('restaurants_open_now')
      .select(`
        id,
        name,
        slug,
        address,
        latitude,
        longitude,
        google_rating,
        price_range,
        cuisine_type_ids,
        establishment_type_id,
        cover_image_url,
        favorites_count
      `)
      .eq('is_currently_open', true);

    // Agregar filtros si se proporcionan
    if (filters.cuisineTypeIds && filters.cuisineTypeIds.length > 0) {
      query = query.overlaps('cuisine_type_ids', filters.cuisineTypeIds);
    }

    if (filters.priceRanges && filters.priceRanges.length > 0) {
      query = query.in('price_range', filters.priceRanges);
    }

    const { data, error } = await query;

    if (error) throw error;

    let processedData = data || [];

    // Calcular distancia si se proporciona ubicación
    if (filters.userLat && filters.userLng) {
      processedData = processedData.map((restaurant: any) => ({
        ...restaurant,
        distance_km: calculateDistance(
          filters.userLat!,
          filters.userLng!,
          restaurant.latitude,
          restaurant.longitude
        )
      }));

      if (filters.maxDistance) {
        processedData = processedData.filter(
          (restaurant: any) => restaurant.distance_km <= filters.maxDistance!
        );
      }

      processedData.sort((a: any, b: any) => a.distance_km - b.distance_km);
    } else {
      processedData.sort((a: any, b: any) => b.favorites_count - a.favorites_count);
    }

    return processedData;
  } catch (error) {
    console.error('Error in getOpenRestaurantsWithFilters:', error);
    throw error;
  }
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
