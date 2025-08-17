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
}

interface UseRestaurantsProps {
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
  isBudgetFriendly?: boolean;
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

export const useRestaurants = ({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 1000,
  cuisineTypeIds,
  priceRanges,
  isHighRated = false,
  selectedEstablishmentTypes,
  selectedDietTypes,
  isOpenNow = false,
  isBudgetFriendly = false
}: UseRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching restaurants with params:', {
          searchQuery,
          userLat,
          userLng,
          maxDistance,
          cuisineTypeIds,
          priceRanges,
          isHighRated,
          selectedEstablishmentTypes,
          selectedDietTypes,
          isOpenNow,
          isBudgetFriendly
        });

        let effectivePriceRanges = priceRanges;
        if (isBudgetFriendly) {
          effectivePriceRanges = ['€'];
          console.log('Budget-friendly filter active, filtering by € only');
        }

        let query = supabase
          .from('restaurants')
          .select(`
            id,
            name,
            slug,
            description,
            price_range,
            google_rating,
            google_rating_count,
            latitude,
            longitude,
            favorites_count,
            cover_image_url,
            logo_url,
            establishment_types!inner(name),
            restaurant_cuisines!inner(
              cuisine_types!inner(name)
            ),
            restaurant_services(
              services!inner(name)
            )
            ${isOpenNow ? `,
            restaurant_schedules!inner(
              day_of_week,
              opening_time,
              closing_time,
              is_closed
            )` : ''}
          `)
          .eq('is_active', true)
          .eq('is_published', true)
          .is('deleted_at', null);

        if (isOpenNow) {
          console.log('Applying "open now" filter with SQL optimization');
          
          const currentDay = new Date().getDay();
          const currentTime = new Date().toTimeString().slice(0, 8);
          
          query = query
            .eq('restaurant_schedules.day_of_week', currentDay)
            .eq('restaurant_schedules.is_closed', false)
            .lte('restaurant_schedules.opening_time', currentTime)
            .gte('restaurant_schedules.closing_time', currentTime);
        }

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        if (isHighRated) {
          query = query.gte('google_rating', 4.5);
        }

        if (isBudgetFriendly) {
          console.log('Applying budget-friendly filter: price_range = €');
          query = query.eq('price_range', '€');
        } else if (effectivePriceRanges && effectivePriceRanges.length > 0) {
          console.log('Converting price range values to display texts:', effectivePriceRanges);
          
          const { data: priceRangeData, error: priceError } = await supabase
            .from('price_ranges')
            .select('value, display_text')
            .in('value', effectivePriceRanges);

          if (priceError) {
            console.error('Error fetching price ranges:', priceError);
          } else if (priceRangeData && priceRangeData.length > 0) {
            const priceDisplayTexts = priceRangeData.map(range => range.display_text);
            console.log('Mapped price display texts:', priceDisplayTexts);
            query = query.in('price_range', priceDisplayTexts as any);
          }
        }

        if (cuisineTypeIds && cuisineTypeIds.length > 0) {
          console.log('Applying cuisine type filter for IDs:', cuisineTypeIds);
          query = query.in('restaurant_cuisines.cuisine_type_id', cuisineTypeIds);
        }

        if (selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0) {
          console.log('Applying establishment type filter for IDs:', selectedEstablishmentTypes);
          query = query.in('establishment_type_id', selectedEstablishmentTypes);
        }

        const { data, error } = await query.limit(50);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Raw data from restaurants table:', data);

        let formattedData = data?.map((restaurant: any) => {
          let distance_km = null;
          if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
            distance_km = haversineDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
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
            cuisine_types: restaurant.restaurant_cuisines?.map((rc: any) => rc.cuisine_types?.name).filter(Boolean) || [],
            establishment_type: restaurant.establishment_types?.name,
            services: restaurant.restaurant_services?.map((rs: any) => rs.services?.name).filter(Boolean) || [],
            favorites_count: restaurant.favorites_count || 0,
            cover_image_url: restaurant.cover_image_url,
            logo_url: restaurant.logo_url
          };
        }).filter(Boolean) || [];

        // Aplicar filtro de dieta usando la nueva vista materializada optimizada
        if (selectedDietTypes && selectedDietTypes.length > 0) {
          console.log('Applying simplified diet type filter for IDs:', selectedDietTypes);
          
          // Obtener las categorías de los tipos de dieta seleccionados
          const { data: dietTypesData, error: dietTypesError } = await supabase
            .from('diet_types')
            .select('*')
            .in('id', selectedDietTypes);

          if (dietTypesError) {
            console.error('Error fetching diet types:', dietTypesError);
          } else if (dietTypesData && dietTypesData.length > 0) {
            console.log('Diet types to apply:', dietTypesData);
            
            const restaurantIds = formattedData.map(r => r.id);
            
            if (restaurantIds.length > 0) {
              // Usar la nueva vista materializada para filtrado ultra-rápido
              let dietQuery = supabase
                .from('restaurant_diet_stats')
                .select('restaurant_id')
                .in('restaurant_id', restaurantIds);

              // Construir condición OR para las dietas seleccionadas
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

              const { data: validRestaurantsData, error: dietError } = await dietQuery;

              if (dietError) {
                console.error('Error filtering by diet using materialized view:', dietError);
              } else if (validRestaurantsData) {
                const validRestaurantIds = new Set(validRestaurantsData.map(r => r.restaurant_id));
                console.log('Valid restaurants after simplified diet filtering:', validRestaurantIds.size, 'out of', formattedData.length);

                formattedData = formattedData.filter(restaurant => 
                  validRestaurantIds.has(restaurant.id)
                );
                
                console.log('Final restaurants after simplified diet filtering:', formattedData.length);
              }
            }
          }
        }

        let sortedData = formattedData;
        if (userLat && userLng) {
          sortedData = formattedData.sort((a, b) => {
            if (a.distance_km === null && b.distance_km === null) return 0;
            if (a.distance_km === null) return 1;
            if (b.distance_km === null) return -1;
            return a.distance_km - b.distance_km;
          });
          
          console.log('Restaurants sorted by distance:', sortedData.length, 'restaurants');
        } else {
          sortedData = formattedData.sort((a, b) => {
            if (b.favorites_count !== a.favorites_count) {
              return b.favorites_count - a.favorites_count;
            }
            return (b.google_rating || 0) - (a.google_rating || 0);
          });
          
          console.log('Restaurants sorted by popularity:', sortedData.length, 'restaurants');
        }

        console.log('Final formatted restaurants after all filters:', sortedData.length);
        
        setRestaurants(sortedData);

      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();

    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      console.log('useRestaurants: Received favoriteToggled event:', { restaurantId, newCount });
      
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
            console.log('useRestaurants: Received favorites_count update from DB:', { restaurantId, newFavoritesCount });
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

  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, isHighRated, selectedEstablishmentTypes, selectedDietTypes, isOpenNow, isBudgetFriendly]);

  return { restaurants, loading, error };
};
