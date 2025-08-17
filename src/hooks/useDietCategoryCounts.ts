
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DietCategoryCounts {
  vegetarian: number;
  vegan: number;
  gluten_free: number;
  healthy: number;
}

interface UseDietCategoryCountsProps {
  cityId?: number;
  userLat?: number;
  userLng?: number;
  radiusKm?: number;
}

export const useDietCategoryCounts = ({ 
  cityId, 
  userLat, 
  userLng, 
  radiusKm = 10 
}: UseDietCategoryCountsProps = {}) => {
  const [counts, setCounts] = useState<DietCategoryCounts>({
    vegetarian: 0,
    vegan: 0,
    gluten_free: 0,
    healthy: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching diet category counts for:', { cityId, userLat, userLng, radiusKm });

        const { data, error } = await supabase.rpc('get_diet_category_counts', {
          city_id: cityId || null,
          user_lat: userLat || null,
          user_lng: userLng || null,
          radius_km: radiusKm
        });

        if (error) {
          console.error('Error fetching diet category counts:', error);
          throw error;
        }

        if (data && data.length > 0) {
          const result = data[0];
          setCounts({
            vegetarian: result.vegetarian_count || 0,
            vegan: result.vegan_count || 0,
            gluten_free: result.gluten_free_count || 0,
            healthy: result.healthy_count || 0
          });
        } else {
          setCounts({
            vegetarian: 0,
            vegan: 0,
            gluten_free: 0,
            healthy: 0
          });
        }

        console.log('Diet category counts received:', counts);

      } catch (err) {
        console.error('Error in useDietCategoryCounts:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar contadores de dieta');
        setCounts({
          vegetarian: 0,
          vegan: 0,
          gluten_free: 0,
          healthy: 0
        });
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchCounts, 100);
    return () => clearTimeout(timeoutId);
  }, [cityId, userLat, userLng, radiusKm]);

  return { counts, loading, error };
};
