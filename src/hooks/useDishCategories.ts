
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DishCategory {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
  icon_url?: string;
  display_order?: number;
}

export const useDishCategories = () => {
  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('dish_categories')
          .select('id, name, slug, icon, icon_url, display_order')
          .order('display_order', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (e) {
        console.error('Error fetching dish categories:', e);
        setError(e instanceof Error ? e.message : 'Error al cargar categorías');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
