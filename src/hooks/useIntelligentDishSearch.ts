
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DishSearchResult {
  id: number;
  name: string;
  description?: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_slug: string;
  similarity_score: number;
}

export const useIntelligentDishSearch = (query: string) => {
  const [results, setResults] = useState<DishSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchDishes = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Intelligent dish search for query:', query);

        // Usar la función de búsqueda inteligente
        const { data, error } = await supabase
          .rpc('intelligent_dish_search' as any, {
            search_query: query,
            search_limit: 30
          });

        if (error) {
          console.error('Error in intelligent dish search:', error);
          throw error;
        }

        if (data && Array.isArray(data)) {
          const formattedResults: DishSearchResult[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            restaurant_id: item.restaurant_id,
            restaurant_name: item.restaurant_name,
            restaurant_slug: item.restaurant_slug,
            similarity_score: item.similarity_score || 0
          }));

          setResults(formattedResults);
          console.log('Intelligent dish search results:', formattedResults);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error in intelligent dish search:', err);
        setError(err instanceof Error ? err.message : 'Error en búsqueda de platos');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchDishes, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { results, loading, error };
};
