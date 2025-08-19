
import { supabase } from '@/integrations/supabase/client';

// Consulta simple para verificar si un restaurante específico está abierto
export const isRestaurantOpenNow = async (restaurantId: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('is_restaurant_open_now', { restaurant_id_param: restaurantId });
    
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

// Obtener todos los restaurantes abiertos ahora mismo
export const getOpenRestaurantsNow = async () => {
  try {
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
        cuisine_types,
        establishment_type,
        cover_image_url,
        favorites_count
      `)
      .eq('is_active', true)
      .is('deleted_at', null);

    if (error) throw error;

    // Filtrar restaurantes abiertos usando nuestra función
    const openRestaurants = [];
    for (const restaurant of data || []) {
      const isOpen = await isRestaurantOpenNow(restaurant.id);
      if (isOpen) {
        openRestaurants.push(restaurant);
      }
    }

    return openRestaurants;
  } catch (error) {
    console.error('Error fetching open restaurants:', error);
    throw error;
  }
};

// Consulta SQL más eficiente usando la función directamente
export const getOpenRestaurantsWithSQL = async (filters: {
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
}) => {
  try {
    let query = `
      SELECT r.id, r.name, r.slug, r.address, r.latitude, r.longitude, 
             r.google_rating, r.price_range, r.cuisine_types, 
             r.establishment_type, r.cover_image_url, r.favorites_count
      FROM restaurants r
      WHERE r.is_active = true 
        AND r.deleted_at IS NULL
        AND is_restaurant_open_now(r.id) = true
    `;

    const queryParams: any = {};

    // Agregar filtros si se proporcionan
    if (filters.cuisineTypeIds && filters.cuisineTypeIds.length > 0) {
      query += ` AND r.cuisine_type_ids && $${Object.keys(queryParams).length + 1}`;
      queryParams[Object.keys(queryParams).length + 1] = filters.cuisineTypeIds;
    }

    if (filters.priceRanges && filters.priceRanges.length > 0) {
      query += ` AND r.price_range = ANY($${Object.keys(queryParams).length + 1})`;
      queryParams[Object.keys(queryParams).length + 1] = filters.priceRanges;
    }

    // Agregar cálculo de distancia si se proporciona ubicación
    if (filters.userLat && filters.userLng) {
      query = query.replace(
        'r.favorites_count',
        `r.favorites_count,
         ST_Distance(
           ST_Point($${Object.keys(queryParams).length + 1}, $${Object.keys(queryParams).length + 2})::geography,
           ST_Point(r.longitude, r.latitude)::geography
         ) / 1000 as distance_km`
      );
      
      queryParams[Object.keys(queryParams).length + 1] = filters.userLng;
      queryParams[Object.keys(queryParams).length + 2] = filters.userLat;

      if (filters.maxDistance) {
        query += ` HAVING ST_Distance(
          ST_Point($${Object.keys(queryParams).length - 1}, $${Object.keys(queryParams).length})::geography,
          ST_Point(r.longitude, r.latitude)::geography
        ) / 1000 <= $${Object.keys(queryParams).length + 1}`;
        queryParams[Object.keys(queryParams).length + 1] = filters.maxDistance;
      }

      query += ` ORDER BY distance_km`;
    } else {
      query += ` ORDER BY r.favorites_count DESC`;
    }

    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: query,
      params: queryParams
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error in getOpenRestaurantsWithSQL:', error);
    throw error;
  }
};
