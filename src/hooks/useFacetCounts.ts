
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDietCategoryCounts } from './useDietCategoryCounts';

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

  // Use the new diet category counts hook
  const { counts: dietCounts, loading: dietLoading, error: dietError } = useDietCategoryCounts({
    cityId,
    userLat,
    userLng,
    radiusKm
  });

  useEffect(() => {
    const fetchFacetCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching facet counts for:', { cityId, userLat, userLng, radiusKm });

        // Try to get facet data from the existing RPC function
        const { data, error } = await supabase.rpc('get_facets_for_location' as any, {
          target_city_id: cityId || null,
          user_lat: userLat || null,
          user_lng: userLng || null,
          radius_km: radiusKm
        });

        if (error) {
          console.error('Error fetching facet counts:', error);
          // If RPC doesn't exist, create a basic structure
          setFacetData({
            cuisines: [],
            price_ranges: [],
            establishment_types: [],
            diet_categories: dietCounts,
            last_updated: new Date().toISOString()
          });
        } else if (data) {
          // Use data from RPC but override diet_categories with new counts
          setFacetData({
            ...data,
            diet_categories: dietCounts
          });
        } else {
          setFacetData({
            cuisines: [],
            price_ranges: [],
            establishment_types: [],
            diet_categories: dietCounts,
            last_updated: new Date().toISOString()
          });
        }

        console.log('Facet counts received with new diet categories:', { ...facetData, diet_categories: dietCounts });

      } catch (err) {
        console.error('Error in useFacetCounts:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar contadores de filtros');
        setFacetData({
          cuisines: [],
          price_ranges: [],
          establishment_types: [],
          diet_categories: dietCounts,
          last_updated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    // Wait for diet counts to load
    if (!dietLoading) {
      const timeoutId = setTimeout(fetchFacetCounts, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [cityId, userLat, userLng, radiusKm, dietLoading, JSON.stringify(dietCounts)]);

  // Combine loading states and errors
  const combinedLoading = loading || dietLoading;
  const combinedError = error || dietError;

  return { facetData, loading: combinedLoading, error: combinedError };
};
