
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
        console.log('Intelligent search for query:', query);

        // Usar la función de búsqueda inteligente
        const { data, error } = await supabase.rpc('intelligent_location_search', {
          search_query: query,
          search_limit: 8
        });

        if (error) {
          console.error('Error in intelligent search:', error);
          // Fallback a búsqueda tradicional si la función inteligente falla
          await fallbackSearch(query);
        } else {
          const formattedSuggestions: LocationSuggestion[] = (data || []).map((item: any) => ({
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
          console.log('Intelligent search results:', formattedSuggestions);
        }
      } catch (error) {
        console.error('Error in intelligent location search:', error);
        // Fallback a búsqueda tradicional
        await fallbackSearch(query);
      } finally {
        setLoading(false);
      }
    };

    const fallbackSearch = async (searchQuery: string) => {
      try {
        console.log('Using fallback search for:', searchQuery);
        
        // Búsqueda tradicional como fallback
        const [citiesQuery, municipalitiesQuery, districtsQuery, poisQuery] = await Promise.all([
          supabase
            .from('cities')
            .select(`
              id,
              name,
              latitude,
              longitude,
              provinces!inner(
                name,
                countries!inner(name)
              )
            `)
            .ilike('name', `%${searchQuery}%`)
            .limit(3),
          
          supabase
            .from('municipalities')
            .select(`
              id,
              name,
              latitude,
              longitude,
              provinces!inner(
                name,
                countries!inner(name)
              )
            `)
            .ilike('name', `%${searchQuery}%`)
            .limit(2),
          
          supabase
            .from('districts')
            .select(`
              id,
              name,
              latitude,
              longitude,
              description,
              is_famous,
              cities!inner(
                name,
                provinces!inner(
                  name,
                  countries!inner(name)
                )
              )
            `)
            .ilike('name', `%${searchQuery}%`)
            .limit(2),
          
          supabase
            .from('points_of_interest')
            .select(`
              id,
              name,
              latitude,
              longitude,
              description,
              type,
              cities(
                name,
                provinces!inner(
                  name,
                  countries!inner(name)
                )
              )
            `)
            .ilike('name', `%${searchQuery}%`)
            .in('type', ['gastronomic_area', 'food_district', 'culinary_zone', 'restaurant_cluster'])
            .eq('is_active', true)
            .limit(1)
        ]);

        const fallbackSuggestions: LocationSuggestion[] = [];

        // Formatear ciudades
        citiesQuery.data?.forEach(city => {
          fallbackSuggestions.push({
            id: city.id,
            name: city.name,
            type: 'city',
            latitude: city.latitude,
            longitude: city.longitude,
            parent: `${city.provinces?.name}, ${city.provinces?.countries?.name}`
          });
        });

        // Formatear municipios
        municipalitiesQuery.data?.forEach(municipality => {
          fallbackSuggestions.push({
            id: municipality.id,
            name: municipality.name,
            type: 'municipality',
            latitude: municipality.latitude,
            longitude: municipality.longitude,
            parent: `${municipality.provinces?.name}, ${municipality.provinces?.countries?.name}`
          });
        });

        // Formatear distritos
        districtsQuery.data?.forEach(district => {
          fallbackSuggestions.push({
            id: district.id,
            name: district.name,
            type: 'district',
            latitude: district.latitude,
            longitude: district.longitude,
            parent: `${district.cities?.name}, ${district.cities?.provinces?.name}`,
            description: district.description,
            is_famous: district.is_famous
          });
        });

        // Formatear puntos de interés
        poisQuery.data?.forEach(poi => {
          fallbackSuggestions.push({
            id: poi.id,
            name: poi.name,
            type: 'poi',
            latitude: poi.latitude,
            longitude: poi.longitude,
            parent: poi.cities ? `${poi.cities.name}, ${poi.cities.provinces?.name}` : undefined,
            description: poi.description
          });
        });

        setSuggestions(fallbackSuggestions);
        console.log('Fallback search results:', fallbackSuggestions);
      } catch (fallbackError) {
        console.error('Fallback search failed:', fallbackError);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { suggestions, loading };
};
