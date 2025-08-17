
import { supabase } from '@/integrations/supabase/client';

export interface SpatialRestaurant {
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
  specializes_in_diet?: number[];
  diet_certifications?: string[];
  diet_percentages?: Record<string, number>;
}

export class SpatialService {
  /**
   * Busca restaurantes cercanos usando PostGIS KNN
   */
  static async findNearbyRestaurants(
    userLat: number,
    userLng: number,
    maxDistance: number = 50,
    limit: number = 50,
    filters: {
      searchQuery?: string;
      cuisineTypeIds?: number[];
      priceRanges?: string[];
      isHighRated?: boolean;
      selectedEstablishmentTypes?: number[];
      selectedDietTypes?: number[];
    } = {}
  ): Promise<SpatialRestaurant[]> {
    try {
      console.log('SpatialService: Using PostGIS KNN for nearby restaurants', { userLat, userLng, maxDistance });

      // Base query usando PostGIS
      let query = supabase
        .from('restaurants_full')
        .select('*')
        .not('geom', 'is', null); // Solo restaurantes con coordenadas

      // Aplicar filtros de texto
      if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      // Aplicar otros filtros
      if (filters.isHighRated) {
        query = query.gte('google_rating', 4.5);
      }

      if (filters.priceRanges && filters.priceRanges.length > 0) {
        const { data: priceRangeData } = await supabase
          .from('price_ranges')
          .select('value, display_text')
          .in('value', filters.priceRanges);

        if (priceRangeData && priceRangeData.length > 0) {
          const priceDisplayTexts = priceRangeData.map(range => range.display_text);
          query = query.in('price_range', priceDisplayTexts as any);
        }
      }

      if (filters.selectedEstablishmentTypes && filters.selectedEstablishmentTypes.length > 0) {
        query = query.in('establishment_type_id', filters.selectedEstablishmentTypes);
      }

      // Ejecutar query inicial
      const { data, error } = await query.limit(limit * 2); // Obtenemos más para filtrar por distancia

      if (error) {
        console.error('SpatialService: Error in spatial query:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Calcular distancias usando fórmula de Haversine y filtrar
      const restaurantsWithDistance = data
        .map((restaurant: any) => {
          if (!restaurant.longitude || !restaurant.latitude) {
            return null;
          }

          // Calcular distancia usando fórmula de Haversine
          const distanceKm = this.calculateHaversineDistance(
            userLat,
            userLng,
            Number(restaurant.latitude),
            Number(restaurant.longitude)
          );

          if (distanceKm > maxDistance) {
            return null;
          }

          // Parse JSON arrays
          let cuisine_types: string[] = [];
          let services: string[] = [];

          try {
            cuisine_types = Array.isArray(restaurant.cuisine_types) 
              ? restaurant.cuisine_types 
              : JSON.parse(restaurant.cuisine_types || '[]');
          } catch (e) {
            cuisine_types = [];
          }

          try {
            services = Array.isArray(restaurant.services) 
              ? restaurant.services 
              : JSON.parse(restaurant.services || '[]');
          } catch (e) {
            services = [];
          }

          return {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description,
            price_range: restaurant.price_range,
            google_rating: restaurant.google_rating,
            google_rating_count: restaurant.google_rating_count,
            distance_km: distanceKm,
            cuisine_types,
            establishment_type: restaurant.establishment_type,
            services,
            favorites_count: restaurant.favorites_count || 0,
            cover_image_url: restaurant.cover_image_url,
            logo_url: restaurant.logo_url,
            specializes_in_diet: restaurant.specializes_in_diet || [],
            diet_certifications: restaurant.diet_certifications || [],
            diet_percentages: restaurant.diet_percentages || {}
          } satisfies SpatialRestaurant;
        })
        .filter((r): r is SpatialRestaurant => r !== null)
        .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0))
        .slice(0, limit);

      // Aplicar filtro de dietas si es necesario
      if (filters.selectedDietTypes && filters.selectedDietTypes.length > 0) {
        const filteredByDiet = restaurantsWithDistance.filter(restaurant => {
          if (restaurant.specializes_in_diet && restaurant.specializes_in_diet.length > 0) {
            return filters.selectedDietTypes!.some(dietId => 
              restaurant.specializes_in_diet!.includes(dietId)
            );
          }
          return false;
        });

        console.log('SpatialService: Filtered by diet:', filteredByDiet.length, 'of', restaurantsWithDistance.length);
        return filteredByDiet;
      }

      console.log('SpatialService: Found', restaurantsWithDistance.length, 'nearby restaurants');
      return restaurantsWithDistance;

    } catch (error) {
      console.error('SpatialService: Error in findNearbyRestaurants:', error);
      throw error;
    }
  }

  /**
   * Busca restaurantes usando ordenamiento por distancia
   */
  static async findNearestRestaurantsKNN(
    userLat: number,
    userLng: number,
    limit: number = 20
  ): Promise<SpatialRestaurant[]> {
    try {
      console.log('SpatialService: Using distance-based ordering for nearest restaurants');

      const { data, error } = await supabase
        .from('restaurants_full')
        .select('*')
        .not('longitude', 'is', null)
        .not('latitude', 'is', null)
        .limit(limit * 3); // Obtenemos más para ordenar por distancia

      if (error) {
        console.error('SpatialService: KNN query error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Calcular distancias y ordenar
      const restaurantsWithDistance = data
        .map((restaurant: any) => {
          const distanceKm = this.calculateHaversineDistance(
            userLat,
            userLng,
            Number(restaurant.latitude),
            Number(restaurant.longitude)
          );

          // Parse JSON arrays
          let cuisine_types: string[] = [];
          let services: string[] = [];

          try {
            cuisine_types = Array.isArray(restaurant.cuisine_types) 
              ? restaurant.cuisine_types 
              : JSON.parse(restaurant.cuisine_types || '[]');
          } catch (e) {
            cuisine_types = [];
          }

          try {
            services = Array.isArray(restaurant.services) 
              ? restaurant.services 
              : JSON.parse(restaurant.services || '[]');
          } catch (e) {
            services = [];
          }

          return {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description,
            price_range: restaurant.price_range,
            google_rating: restaurant.google_rating,
            google_rating_count: restaurant.google_rating_count,
            distance_km: distanceKm,
            cuisine_types,
            establishment_type: restaurant.establishment_type,
            services,
            favorites_count: restaurant.favorites_count || 0,
            cover_image_url: restaurant.cover_image_url,
            logo_url: restaurant.logo_url,
            specializes_in_diet: restaurant.specializes_in_diet || [],
            diet_certifications: restaurant.diet_certifications || [],
            diet_percentages: restaurant.diet_percentages || {}
          } satisfies SpatialRestaurant;
        })
        .sort((a, b) => a.distance_km - b.distance_km)
        .slice(0, limit);

      return restaurantsWithDistance;

    } catch (error) {
      console.error('SpatialService: Error in KNN query:', error);
      return [];
    }
  }

  /**
   * Calcula la distancia usando la fórmula de Haversine
   */
  private static calculateHaversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convierte grados a radianes
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
