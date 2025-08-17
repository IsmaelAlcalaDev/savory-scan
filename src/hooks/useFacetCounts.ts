
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FacetData {
  cuisines: Array<{
    id: number;
    name: string;
    icon: string;
    count: number;
  }>;
  price_ranges: Array<{
    value: string;
    count: number;
  }>;
  establishment_types: Array<{
    id: number;
    name: string;
    icon: string;
    count: number;
  }>;
  diet_categories: {
    vegetarian: number;
    vegan: number;
    gluten_free: number;
    healthy: number;
  };
  last_updated: string;
}

interface UseFacetCountsProps {
  cityId?: number;
  userLat?: number;
  userLng?: number;
  radiusKm?: number;
}

export const useFacetCounts = ({ cityId, userLat, userLng, radiusKm = 10 }: UseFacetCountsProps = {}) => {
  const [facetData, setFacetData] = useState<FacetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacetCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching facet counts for:', { cityId, userLat, userLng, radiusKm });

        const { data, error } = await supabase.rpc('get_facets_for_location' as any, {
          target_city_id: cityId || null,
          user_lat: userLat || null,
          user_lng: userLng || null,
          radius_km: radiusKm
        });

        if (error) {
          console.error('Error fetching facet counts:', error);
          throw error;
        }

        console.log('Facet counts received:', data);
        setFacetData(data || null);

      } catch (err) {
        console.error('Error in useFacetCounts:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar contadores de filtros');
        setFacetData(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the request slightly
    const timeoutId = setTimeout(fetchFacetCounts, 100);
    return () => clearTimeout(timeoutId);
  }, [cityId, userLat, userLng, radiusKm]);

  return { facetData, loading, error };
};
