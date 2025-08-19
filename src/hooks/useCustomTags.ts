
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CustomTag, CustomTagWithCount } from '@/types/restaurant-schedule';

export const useCustomTags = () => {
  const [tags, setTags] = useState<CustomTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener tags únicos de los platos
      const { data: dishTags, error: dishTagsError } = await supabase
        .from('dishes')
        .select('custom_tags')
        .not('custom_tags', 'eq', '[]')
        .eq('is_active', true);

      if (dishTagsError) throw dishTagsError;

      // Procesar y contar tags
      const tagCounts: Record<string, number> = {};
      
      dishTags?.forEach((dish) => {
        if (dish.custom_tags && Array.isArray(dish.custom_tags)) {
          dish.custom_tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      // Convertir a array de objetos CustomTag
      const processedTags: CustomTag[] = Object.entries(tagCounts).map(([name, count], index) => ({
        id: index + 1,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `Tag personalizado: ${name}`,
        restaurant_id: null,
        created_at: new Date().toISOString(),
        is_active: true
      }));

      setTags(processedTags);
    } catch (err) {
      console.error('Error fetching custom tags:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar tags personalizados');
    } finally {
      setLoading(false);
    }
  };

  const getTagsWithCounts = (): CustomTagWithCount[] => {
    return tags.map(tag => ({
      tag: tag.name,
      count: 1 // Por ahora usamos 1, pero podrías implementar conteo real
    }));
  };

  return { tags, loading, error, getTagsWithCounts };
};
