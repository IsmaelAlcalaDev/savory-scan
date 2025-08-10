
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CuisineType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  icon_url?: string;
  icon_emoji?: string;
}

export const useCuisineTypes = () => {
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCuisineTypes = async () => {
      try {
        setLoading(true);
        console.log('Fetching cuisine types...');
        
        const { data, error } = await supabase
          .from('cuisine_types')
          .select('id, name, slug, icon, icon_url, icon_emoji')
          .order('name');

        if (error) {
          console.error('Supabase error fetching cuisine types:', error);
          throw error;
        }
        
        console.log('Raw cuisine types data:', data);
        setCuisineTypes(data || []);
      } catch (err) {
        console.error('Error fetching cuisine types:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar tipos de cocina');
      } finally {
        setLoading(false);
      }
    };

    fetchCuisineTypes();
  }, []);

  return { cuisineTypes, loading, error };
};
