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

interface UseEnhancedRestaurantsProps {
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

const calculateDietPercentage = (dishes: any[], category: string): number => {
  if (dishes.length === 0) return 0;
  
  const matchingDishes = dishes.filter(dish => {
    switch (category) {
      case 'vegetarian': return dish.is_vegetarian;
      case 'vegan': return dish.is_vegan;
      case 'gluten_free': return dish.is_gluten_free;
      case 'healthy': return dish.is_healthy;
      default: return false;
    }
  });
  
  return Math.round((matchingDishes.length / dishes.length) * 100);
};

export const useEnhancedRestaurants = ({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 50,
  cuisineTypeIds,
  priceRanges,
  isHighRated = false,
  selectedEstablishmentTypes,
  selectedDietTypes,
  isOpenNow = false,
  isBudgetFriendly = false
}: UseEnhancedRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);

        // Handle budget-friendly filter - override price ranges when active
        let effectivePriceRanges = priceRanges;
        if (isBudgetFriendly) {
          effectivePriceRanges = ['budget']; // This will be converted to '€' below
          console.log('Budget-friendly filter active, forcing price range to budget');
        }

        // Convert price range values to display_text for filtering
        let priceDisplayTexts: string[] | undefined;
        if (effectivePriceRanges && effectivePriceRanges.length > 0) {
          const { data: priceRangeData } = await supabase
            .from('price_ranges')
            .select('value, display_text')
            .in('value', effectivePriceRanges);

          if (priceRangeData && priceRangeData.length > 0) {
            priceDisplayTexts = priceRangeData.map(range => range.display_text);
          }
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
            specializes_in_diet,
            diet_certifications,
            diet_percentages,
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

        // Filtro "Abierto ahora" - optimizado con SQL
        if (isOpenNow) {
          console.log('Applying "open now" filter with SQL optimization');
          
          // Obtener día de la semana actual (0=domingo, 1=lunes, etc.)
          const currentDay = new Date().getDay();
          const currentTime = new Date().toTimeString().slice(0, 8); // HH:MM:SS format
          
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

        if (priceDisplayTexts && priceDisplayTexts.length > 0) {
          query = query.in('price_range', priceDisplayTexts as any);
        }

        if (cuisineTypeIds && cuisineTypeIds.length > 0) {
          query = query.in('restaurant_cuisines.cuisine_type_id', cuisineTypeIds);
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
            logo_url: restaurant.logo_url,
            specializes_in_diet: restaurant.specializes_in_diet || [],
            diet_certifications: restaurant.diet_certifications || [],
            diet_percentages: restaurant.diet_percentages || {}
          };
        }).filter(Boolean) || [];

        // Enhanced diet type filtering with specializations and calculated percentages
        if (selectedDietTypes && selectedDietTypes.length > 0) {
          const { data: dietTypesData } = await supabase
            .from('diet_types')
            .select('*')
            .in('id', selectedDietTypes);

          if (dietTypesData && dietTypesData.length > 0) {
            const restaurantIds = formattedData.map(r => r.id);
            
            if (restaurantIds.length > 0) {
              // Check for restaurants with diet specializations first (faster)
              const specializedRestaurants = new Set<number>();
              formattedData.forEach(restaurant => {
                if (restaurant.specializes_in_diet && restaurant.specializes_in_diet.length > 0) {
                  const hasMatchingSpecialization = selectedDietTypes.some(dietId => 
                    restaurant.specializes_in_diet!.includes(dietId)
                  );
                  if (hasMatchingSpecialization) {
                    specializedRestaurants.add(restaurant.id);
                  }
                }
              });

              // For restaurants without specializations, calculate percentages
              const { data: dishesData } = await supabase
                .from('dishes')
                .select('restaurant_id, is_vegetarian, is_vegan, is_gluten_free, is_healthy')
                .in('restaurant_id', restaurantIds.filter(id => !specializedRestaurants.has(id)))
                .eq('is_active', true)
                .is('deleted_at', null);

              if (dishesData) {
                const dishesByRestaurant: Record<number, any[]> = {};
                dishesData.forEach(dish => {
                  if (!dishesByRestaurant[dish.restaurant_id]) {
                    dishesByRestaurant[dish.restaurant_id] = [];
                  }
                  dishesByRestaurant[dish.restaurant_id].push(dish);
                });

                const calculatedRestaurants = new Set<number>();
                dietTypesData.forEach((dietType: any) => {
                  Object.entries(dishesByRestaurant).forEach(([restaurantIdStr, dishes]) => {
                    const restaurantId = parseInt(restaurantIdStr);
                    const percentage = calculateDietPercentage(dishes, dietType.category);
                    
                    if (percentage >= dietType.min_percentage && percentage <= dietType.max_percentage) {
                      calculatedRestaurants.add(restaurantId);
                    }
                  });
                });

                // Combine specialized and calculated restaurants
                const validRestaurantIds = new Set([...specializedRestaurants, ...calculatedRestaurants]);
                formattedData = formattedData.filter(restaurant => 
                  validRestaurantIds.has(restaurant.id)
                );
              } else {
                // If no dishes data, keep only specialized restaurants
                formattedData = formattedData.filter(restaurant => 
                  specializedRestaurants.has(restaurant.id)
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
        }

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
