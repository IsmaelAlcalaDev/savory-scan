
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DietType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export const useDietTypes = () => {
  const [dietTypes, setDietTypes] = useState<DietType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDietTypes = async () => {
      try {
        setLoading(true);
        console.log('Fetching diet types...');
        
        const { data, error } = await supabase
          .from('diet_types')
          .select('id, name, slug, icon')
          .order('name');

        if (error) {
          console.error('Supabase error fetching diet types:', error);
          throw error;
        }
        
        console.log('Raw diet types data:', data);
        setDietTypes(data || []);
      } catch (err) {
        console.error('Error fetching diet types:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar tipos de dieta');
      } finally {
        setLoading(false);
      }
    };

    fetchDietTypes();
  }, []);

  return { dietTypes, loading, error };
};
