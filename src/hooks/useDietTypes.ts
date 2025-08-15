
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DietType, DietCategory } from '@/types/dietType';

export const useDietTypes = () => {
  const [dietTypes, setDietTypes] = useState<DietType[]>([]);
  const [dietCategories, setDietCategories] = useState<DietCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDietTypes = async () => {
      try {
        setLoading(true);
        console.log('Fetching diet types...');
        
        const { data, error } = await supabase
          .from('diet_types')
          .select('*')
          .order('category, min_percentage');

        if (error) {
          console.error('Supabase error fetching diet types:', error);
          throw error;
        }
        
        console.log('Raw diet types data:', data);
        
        // Transform the data to match our DietType interface
        const transformedData: DietType[] = (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          icon: item.icon,
          category: item.category as 'vegetarian' | 'vegan' | 'gluten_free' | 'healthy',
          min_percentage: item.min_percentage || 0,
          max_percentage: item.max_percentage || 100
        }));
        
        console.log('Transformed diet types:', transformedData);
        setDietTypes(transformedData);

        // Group diet types by category
        const groupedCategories: Record<string, DietType[]> = {};
        transformedData.forEach(dietType => {
          if (!groupedCategories[dietType.category]) {
            groupedCategories[dietType.category] = [];
          }
          groupedCategories[dietType.category].push(dietType);
        });

        const categories: DietCategory[] = Object.entries(groupedCategories).map(([category, options]) => ({
          category,
          displayName: getCategoryDisplayName(category),
          options
        }));

        console.log('Diet categories grouped:', categories);
        setDietCategories(categories);
      } catch (err) {
        console.error('Error fetching diet types:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar tipos de dieta');
      } finally {
        setLoading(false);
      }
    };

    fetchDietTypes();
  }, []);

  return { dietTypes, dietCategories, loading, error };
};

const getCategoryDisplayName = (category: string): string => {
  const displayNames: Record<string, string> = {
    vegetarian: 'Vegetariano',
    vegan: 'Vegano',
    gluten_free: 'Sin Gluten',
    healthy: 'Saludable'
  };
  return displayNames[category] || category;
};
