
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationSuggestion {
  id: number;
  name: string;
  type: 'city' | 'municipality' | 'district' | 'poi';
  latitude: number;
  longitude: number;
  parent?: string;
  description?: string;
  is_famous?: boolean;
  similarity_score?: number;
}

export const useIntelligentLocationSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchLocations = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        console.log('Optimized intelligent location search for query:', query);

        // Use the new optimized RPC function with trigram indexes
        const { data, error } = await supabase
          .rpc('intelligent_location_search', {
            search_query: query.trim(),
            search_limit: 8
          });

        if (error) {
          console.error('Error in optimized location search:', error);
          throw error;
        }

        if (data && Array.isArray(data)) {
          const formattedSuggestions: LocationSuggestion[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type as 'city' | 'municipality' | 'district' | 'poi',
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            parent: item.parent || undefined,
            description: item.description || undefined,
            is_famous: item.is_famous || false,
            similarity_score: item.similarity_score || 0
          }));

          setSuggestions(formattedSuggestions);
          console.log('Optimized location search results:', formattedSuggestions.length, 'found');
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error in optimized location search:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Maintain 300ms debounce for location search (optimal for this use case)
    const debounceTimer = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { suggestions, loading };
};
