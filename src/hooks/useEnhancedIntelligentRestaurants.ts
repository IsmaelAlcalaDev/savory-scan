import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
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

interface UseEnhancedIntelligentRestaurantsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  isOpenNow?: boolean;
}

const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const useEnhancedIntelligentRestaurants = ({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 50,
  cuisineTypeIds,
  priceRanges,
  isHighRated = false,
  selectedEstablishmentTypes,
  selectedDietTypes,
  isOpenNow = false
}: UseEnhancedIntelligentRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('restaurants_full')
          .select('*');

        if (searchQuery && searchQuery.trim().length > 0) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
          console.log('Using text search for intelligent restaurants:', searchQuery);
        }

        if (isHighRated) {
          query = query.gte('google_rating', 4.5);
        }

        if (priceRanges && priceRanges.length > 0) {
          const { data: priceRangeData } = await supabase
            .from('price_ranges')
            .select('value, display_text')
            .in('value', priceRanges);

          if (priceRangeData && priceRangeData.length > 0) {
            const priceDisplayTexts = priceRangeData.map(range => range.display_text);
            query = query.in('price_range', priceDisplayTexts as any);
          }
        }

        if (selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0) {
          query = query.in('establishment_type_id', selectedEstablishmentTypes);
        }

        const { data, error } = await query.limit(50);

        if (error) {
          throw error;
        }

        let formattedData = data?.map((restaurant: any) => {
          let distance_km = null;
          if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
            distance_km = haversineDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
          }

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
            distance_km,
            cuisine_types,
            establishment_type: restaurant.establishment_type,
            services,
            favorites_count: restaurant.favorites_count || 0,
            cover_image_url: restaurant.cover_image_url,
            logo_url: restaurant.logo_url,
            specializes_in_diet: restaurant.specializes_in_diet || [],
            diet_certifications: restaurant.diet_certifications || [],
            diet_percentages: restaurant.diet_percentages || {}
          };
        }).filter(Boolean) || [];

        // Filtrado simplificado de dieta usando la vista materializada
        if (selectedDietTypes && selectedDietTypes.length > 0) {
          const { data: dietTypesData } = await supabase
            .from('diet_types')
            .select('*')
            .in('id', selectedDietTypes);

          if (dietTypesData && dietTypesData.length > 0) {
            const restaurantIds = formattedData.map(r => r.id);
            
            if (restaurantIds.length > 0) {
              // Usar la vista materializada para filtrado rápido
              let dietQuery = supabase
                .from('restaurant_diet_stats')
                .select('restaurant_id')
                .in('restaurant_id', restaurantIds);

              const dietConditions: string[] = [];
              
              dietTypesData.forEach(dietType => {
                switch (dietType.category) {
                  case 'gluten_free':
                    dietConditions.push('has_gluten_free_options.eq.true');
                    break;
                  case 'healthy':
                    dietConditions.push('has_healthy_options.eq.true');
                    break;
                  case 'vegan':
                    dietConditions.push('has_vegan_options.eq.true');
                    break;
                  case 'vegetarian':
                    dietConditions.push('has_vegetarian_options.eq.true');
                    break;
                }
              });

              if (dietConditions.length > 0) {
                dietQuery = dietQuery.or(dietConditions.join(','));
              }

              const { data: validRestaurantsData } = await dietQuery;
              
              if (validRestaurantsData) {
                const validRestaurantIds = new Set(validRestaurantsData.map(r => r.restaurant_id));
                formattedData = formattedData.filter(restaurant => 
                  validRestaurantIds.has(restaurant.id)
                );
              }
            }
          }
        }

        let sortedData = formattedData;
        if (userLat && userLng) {
          sortedData = formattedData
            .filter(restaurant => {
              if (restaurant.distance_km === null) return false;
              return restaurant.distance_km <= maxDistance;
            })
            .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
        } else {
          sortedData = formattedData.sort((a, b) => (b.favorites_count || 0) - (a.favorites_count || 0));
        }

        setRestaurants(sortedData);

      } catch (err) {
        console.error('Error fetching intelligent restaurants:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();

    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      console.log('useEnhancedIntelligentRestaurants: Received favoriteToggled event:', { restaurantId, newCount });
      
      setRestaurants(prev =>
        prev.map(r => 
          r.id === restaurantId 
            ? { ...r, favorites_count: Math.max(0, newCount) }
            : r
        )
      );
    };

    window.addEventListener('favoriteToggled', handleFavoriteToggled as EventListener);

    const channel = supabase
      .channel('restaurants-favorites-count')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurants' },
        (payload) => {
          const updatedRestaurant = payload.new as any;
          const restaurantId = updatedRestaurant?.id;
          const newFavoritesCount = updatedRestaurant?.favorites_count;
          
          if (typeof restaurantId === 'number' && typeof newFavoritesCount === 'number') {
            console.log('useEnhancedIntelligentRestaurants: Received favorites_count update from DB:', { restaurantId, newFavoritesCount });
            setRestaurants(prev =>
              prev.map(r => 
                r.id === restaurantId 
                  ? { ...r, favorites_count: Math.max(0, newFavoritesCount) }
                  : r
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggled as EventListener);
      supabase.removeChannel(channel);
    };

  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, isHighRated, selectedEstablishmentTypes, selectedDietTypes, isOpenNow]);

  return { restaurants, loading, error };
};
