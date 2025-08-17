
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DietCounts {
  vegetarian: number;
  vegan: number;
  gluten_free: number;
  healthy: number;
}

interface UseOptimizedDietCountsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  selectedEstablishmentTypes?: number[];
  minRating?: number;
}

export const useOptimizedDietCounts = (props: UseOptimizedDietCountsProps) => {
  const [dietCounts, setDietCounts] = useState<DietCounts>({
    vegetarian: 0,
    vegan: 0,
    gluten_free: 0,
    healthy: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    searchQuery = '',
    userLat,
    userLng,
    maxDistance = 50,
    cuisineTypeIds,
    priceRanges,
    selectedEstablishmentTypes,
    minRating
  } = props;

  useEffect(() => {
    const fetchDietCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('useOptimizedDietCounts: Fetching diet filter counts');

        // Use .rpc() with proper type casting
        const { data, error } = await supabase.rpc('get_diet_filter_counts' as any, {
          p_q: searchQuery.trim(),
          p_lat: userLat || null,
          p_lon: userLng || null,
          p_max_km: maxDistance,
          p_cuisines: cuisineTypeIds && cuisineTypeIds.length > 0 ? cuisineTypeIds : null,
          p_price_bands: priceRanges && priceRanges.length > 0 ? priceRanges : null,
          p_est_types: selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0 ? selectedEstablishmentTypes : null,
          p_min_rating: minRating || null
        });

        if (error) {
          console.error('useOptimizedDietCounts: RPC error:', error);
          throw error;
        }

        if (data && Array.isArray(data) && data.length > 0) {
          const counts = data[0] as any;
          setDietCounts({
            vegetarian: counts.vegetarian_count || 0,
            vegan: counts.vegan_count || 0,
            gluten_free: counts.gluten_free_count || 0,
            healthy: counts.healthy_count || 0
          });
        } else {
          setDietCounts({
            vegetarian: 0,
            vegan: 0,
            gluten_free: 0,
            healthy: 0
          });
        }

      } catch (err) {
        console.error('useOptimizedDietCounts: Error:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar conteos de dieta');
        setDietCounts({
          vegetarian: 0,
          vegan: 0,
          gluten_free: 0,
          healthy: 0
        });
      } finally {
        setLoading(false);
      }
    };

    // Debounce the request
    const debounceTimer = setTimeout(fetchDietCounts, 300);
    return () => clearTimeout(debounceTimer);
  }, [
    searchQuery,
    userLat,
    userLng,
    maxDistance,
    JSON.stringify(cuisineTypeIds),
    JSON.stringify(priceRanges),
    JSON.stringify(selectedEstablishmentTypes),
    minRating
  ]);

  return { dietCounts, loading, error };
};
