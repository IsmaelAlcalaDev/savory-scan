
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AutocompleteResult {
  id: number;
  name: string;
  slug: string;
  similarity_score: number;
}

export const useFastAutocomplete = (query: string, limit: number = 10) => {
  const [results, setResults] = useState<AutocompleteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchAutocomplete = async () => {
      if (!query || query.length < 1) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fast autocomplete search for query:', query);

        const { data, error } = await supabase
          .rpc('restaurants_autocomplete', {
            search_query: query,
            search_limit: limit
          });

        if (error) {
          console.error('Error in fast autocomplete:', error);
          throw error;
        }

        if (data && Array.isArray(data)) {
          const formattedResults: AutocompleteResult[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            similarity_score: item.similarity_score || 0
          }));

          setResults(formattedResults);
          console.log('Fast autocomplete results:', formattedResults);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error in fast autocomplete:', err);
        setError(err instanceof Error ? err.message : 'Error en autocompletado');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchAutocomplete, 100); // Very fast debounce for autocomplete
    return () => clearTimeout(debounceTimer);
  }, [query, limit]);

  return { results, loading, error };
};
