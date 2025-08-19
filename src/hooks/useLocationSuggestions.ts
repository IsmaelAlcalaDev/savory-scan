
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
}

export const useLocationSuggestions = (query: string) => {
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
        console.log('Searching locations for query:', query);

        // Buscar en ciudades
        const { data: cities } = await supabase
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
          .ilike('name', `%${query}%`)
          .limit(5);

        // Buscar en municipios
        const { data: municipalities } = await supabase
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
          .ilike('name', `%${query}%`)
          .limit(5);

        // Buscar en distritos (incluyendo barrios famosos)
        const { data: districts } = await supabase
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
          .ilike('name', `%${query}%`)
          .limit(5);

        // Buscar en puntos de interés gastronómico (filtrado por tipo)
        const { data: pois } = await supabase
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
          .ilike('name', `%${query}%`)
          .in('type', ['gastronomic_area', 'food_district', 'culinary_zone', 'restaurant_cluster'])
          .eq('is_active', true)
          .limit(5);

        const allSuggestions: LocationSuggestion[] = [];

        // Formatear ciudades
        cities?.forEach(city => {
          allSuggestions.push({
            id: city.id,
            name: city.name,
            type: 'city',
            latitude: city.latitude,
            longitude: city.longitude,
            parent: `${city.provinces?.name}, ${city.provinces?.countries?.name}`
          });
        });

        // Formatear municipios
        municipalities?.forEach(municipality => {
          allSuggestions.push({
            id: municipality.id,
            name: municipality.name,
            type: 'municipality',
            latitude: municipality.latitude,
            longitude: municipality.longitude,
            parent: `${municipality.provinces?.name}, ${municipality.provinces?.countries?.name}`
          });
        });

        // Formatear distritos
        districts?.forEach(district => {
          allSuggestions.push({
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

        // Formatear puntos de interés gastronómico
        pois?.forEach(poi => {
          allSuggestions.push({
            id: poi.id,
            name: poi.name,
            type: 'poi',
            latitude: poi.latitude,
            longitude: poi.longitude,
            parent: poi.cities ? `${poi.cities.name}, ${poi.cities.provinces?.name}` : undefined,
            description: poi.description
          });
        });

        // Ordenar por relevancia: primero ciudades, luego distritos famosos, etc.
        const sortedSuggestions = allSuggestions.sort((a, b) => {
          // Prioridad por tipo
          const typeOrder = { city: 1, district: 2, municipality: 3, poi: 4 };
          if (typeOrder[a.type] !== typeOrder[b.type]) {
            return typeOrder[a.type] - typeOrder[b.type];
          }
          
          // Dentro del mismo tipo, priorizar barrios famosos
          if (a.type === 'district' && b.type === 'district') {
            if (a.is_famous && !b.is_famous) return -1;
            if (!a.is_famous && b.is_famous) return 1;
          }
          
          // Ordenar alfabéticamente
          return a.name.localeCompare(b.name);
        });

        setSuggestions(sortedSuggestions.slice(0, 8));
        console.log('Location suggestions found:', sortedSuggestions.slice(0, 8));
      } catch (error) {
        console.error('Error searching locations:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { suggestions, loading };
};
