
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
        setError(null);
        console.log('useDietTypes: Starting to fetch diet types...');
        
        const { data, error: supabaseError } = await supabase
          .from('diet_types')
          .select('*')
          .order('category, min_percentage');

        if (supabaseError) {
          console.error('useDietTypes: Supabase error fetching diet types:', supabaseError);
          throw new Error(`Error de base de datos: ${supabaseError.message}`);
        }
        
        console.log('useDietTypes: Raw diet types data:', data);
        
        if (!data || data.length === 0) {
          console.warn('useDietTypes: No diet types found in database');
          setDietTypes([]);
          setDietCategories([]);
          return;
        }

        // Transform the data to match our DietType interface
        const transformedData: DietType[] = data.map((item: any) => {
          const dietType: DietType = {
            id: item.id,
            name: item.name || 'Sin nombre',
            slug: item.slug || 'sin-slug',
            icon: item.icon,
            category: item.category as 'vegetarian' | 'vegan' | 'gluten_free' | 'healthy',
            min_percentage: Number(item.min_percentage) || 0,
            max_percentage: Number(item.max_percentage) || 100
          };
          console.log('useDietTypes: Transformed diet type:', dietType);
          return dietType;
        });
        
        console.log('useDietTypes: All transformed diet types:', transformedData);
        setDietTypes(transformedData);

        // Group diet types by category
        const groupedCategories: Record<string, DietType[]> = {};
        transformedData.forEach(dietType => {
          if (!groupedCategories[dietType.category]) {
            groupedCategories[dietType.category] = [];
          }
          groupedCategories[dietType.category].push(dietType);
        });

        console.log('useDietTypes: Grouped categories:', groupedCategories);

        const categories: DietCategory[] = Object.entries(groupedCategories).map(([category, options]) => ({
          category,
          displayName: getCategoryDisplayName(category),
          options
        }));

        console.log('useDietTypes: Final diet categories:', categories);
        setDietCategories(categories);
      } catch (err) {
        console.error('useDietTypes: Error fetching diet types:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar tipos de dieta';
        setError(errorMessage);
        setDietTypes([]);
        setDietCategories([]);
      } finally {
        setLoading(false);
        console.log('useDietTypes: Finished loading');
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
