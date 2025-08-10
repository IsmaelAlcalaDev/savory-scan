
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DistanceRange {
  id: number;
  name: string;
  display_text: string;
  distance_km: number;
  icon?: string;
}

export const useDistanceRanges = () => {
  const [distanceRanges, setDistanceRanges] = useState<DistanceRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistanceRanges = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('distance_ranges')
          .select('id, name, display_text, distance_km, icon')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        setDistanceRanges(data || []);
      } catch (err) {
        console.error('Error fetching distance ranges:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar rangos de distancia');
      } finally {
        setLoading(false);
      }
    };

    fetchDistanceRanges();
  }, []);

  return { distanceRanges, loading, error };
};
