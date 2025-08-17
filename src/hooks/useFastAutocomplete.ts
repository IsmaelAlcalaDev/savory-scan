
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
        console.log('Optimized trigram autocomplete search for query:', query);

        // Use the existing trigram-optimized RPC function
        const { data, error } = await supabase
          .rpc('fast_restaurant_autocomplete', {
            search_query: query.trim(),
            max_results: limit
          });

        if (error) {
          console.error('Error in optimized trigram autocomplete:', error);
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
          console.log('Optimized trigram autocomplete results:', formattedResults.length, 'found');
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error in optimized trigram autocomplete:', err);
        setError(err instanceof Error ? err.message : 'Error en autocompletado');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Increase debounce to 250ms to reduce server requests while maintaining responsiveness
    const debounceTimer = setTimeout(searchAutocomplete, 250);
    return () => clearTimeout(debounceTimer);
  }, [query, limit]);

  return { results, loading, error };
};
