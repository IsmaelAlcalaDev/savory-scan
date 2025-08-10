
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RatingOption {
  id: number;
  display_text: string;
  min_rating: number;
  icon?: string;
}

export const useRatingOptions = () => {
  const [ratingOptions, setRatingOptions] = useState<RatingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatingOptions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('rating_options')
          .select('id, display_text, min_rating, icon')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        setRatingOptions(data || []);
      } catch (err) {
        console.error('Error fetching rating options:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar opciones de valoración');
      } finally {
        setLoading(false);
      }
    };

    fetchRatingOptions();
  }, []);

  return { ratingOptions, loading, error };
};
