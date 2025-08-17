
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
        console.log('Optimized dish search for query:', query);

        // Use the existing dishes_full view until types are updated
        const { data, error } = await supabase
          .from('dishes_full')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(30);

        if (error) {
          console.error('Error in dish search:', error);
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
            similarity_score: 0.5 // Placeholder until trigram is available
          }));

          setResults(formattedResults);
          console.log('Dish search results:', formattedResults);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error in dish search:', err);
        setError(err instanceof Error ? err.message : 'Error en búsqueda de platos');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchDishes, 200);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { results, loading, error };
};
