
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DietType } from '@/types/dietType';

export const useDietTypes = () => {
  const [dietTypes, setDietTypes] = useState<DietType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDietTypes = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('diet_types')
          .select('id, name, slug, icon, category')
          .order('id');

        if (error) {
          throw error;
        }

        // Type assertion to ensure category matches our DietType interface
        const typedData: DietType[] = (data || []).map(item => ({
          ...item,
          category: item.category as 'vegetarian' | 'vegan' | 'gluten_free' | 'healthy'
        }));

        setDietTypes(typedData);
      } catch (err) {
        console.error('Error fetching diet types:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar tipos de dieta');
        setDietTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDietTypes();
  }, []);

  return { dietTypes, loading, error };
};
