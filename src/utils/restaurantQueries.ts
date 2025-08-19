
import { supabase } from '@/integrations/supabase/client';

// Consulta simple para verificar si un restaurante específico está abierto
export const isRestaurantOpenNow = async (restaurantId: number): Promise<boolean> => {
  try {
    // Usar la función SQL creada en la base de datos
    const { data, error } = await supabase.rpc('is_restaurant_open_now', {
      restaurant_id_param: restaurantId
    });
    
    if (error) {
      console.error('Error checking if restaurant is open:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in isRestaurantOpenNow:', error);
    return false;
  }
};

// Obtener todos los restaurantes abiertos ahora mismo usando la función SQL
export const getOpenRestaurantsNow = async () => {
  try {
    // Primero obtenemos los IDs de restaurantes abiertos
    const { data: openIds, error: idsError } = await supabase.rpc('get_open_restaurant_ids');

    if (idsError) throw idsError;

    if (!openIds || openIds.length === 0) {
      return [];
    }

    // Luego obtenemos los datos completos
    const { data, error } = await supabase
      .from('restaurants')
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
      .in('id', openIds)
      .eq('is_active', true)
      .eq('is_published', true)
      .is('deleted_at', null);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching open restaurants:', error);
    throw error;
  }
};

// Consulta optimizada con filtros
export const getOpenRestaurantsWithFilters = async (filters: {
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
}) => {
  try {
    // Primero obtenemos los IDs de restaurantes abiertos
    const { data: openIds, error: idsError } = await supabase.rpc('get_open_restaurant_ids');

    if (idsError) throw idsError;

    if (!openIds || openIds.length === 0) {
      return [];
    }

    let query = supabase
      .from('restaurants')
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
      .in('id', openIds)
      .eq('is_active', true)
      .eq('is_published', true)
      .is('deleted_at', null);

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
