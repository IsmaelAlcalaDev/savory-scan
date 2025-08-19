
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NearestLocationResult {
  name: string;
  type: 'city' | 'municipality' | 'district' | 'poi';
  distance: number;
  parent?: string;
}

export const useNearestLocation = () => {
  const [loading, setLoading] = useState(false);

  const findNearestLocation = async (latitude: number, longitude: number): Promise<NearestLocationResult | null> => {
    setLoading(true);
    try {
      console.log('Finding nearest location for:', { latitude, longitude });

      // Buscar ciudades cercanas
      const { data: nearestCities } = await supabase
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
        .limit(10);

      // Buscar municipios cercanos
      const { data: nearestMunicipalities } = await supabase
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
        .limit(10);

      // Buscar distritos cercanos
      const { data: nearestDistricts } = await supabase
        .from('districts')
        .select(`
          id,
          name,
          latitude,
          longitude,
          cities!inner(
            name,
            provinces!inner(
              name,
              countries!inner(name)
            )
          )
        `)
        .limit(10);

      // Calcular distancias manualmente y encontrar el más cercano
      const allLocations: (NearestLocationResult & { id: number })[] = [];

      // Agregar ciudades
      nearestCities?.forEach(city => {
        const distance = calculateDistance(latitude, longitude, Number(city.latitude), Number(city.longitude));
        allLocations.push({
          id: city.id,
          name: city.name,
          type: 'city',
          distance,
          parent: `${city.provinces?.name}, ${city.provinces?.countries?.name}`
        });
      });

      // Agregar municipios
      nearestMunicipalities?.forEach(municipality => {
        const distance = calculateDistance(latitude, longitude, Number(municipality.latitude), Number(municipality.longitude));
        allLocations.push({
          id: municipality.id,
          name: municipality.name,
          type: 'municipality',
          distance,
          parent: `${municipality.provinces?.name}, ${municipality.provinces?.countries?.name}`
        });
      });

      // Agregar distritos
      nearestDistricts?.forEach(district => {
        const distance = calculateDistance(latitude, longitude, Number(district.latitude), Number(district.longitude));
        allLocations.push({
          id: district.id,
          name: district.name,
          type: 'district',
          distance,
          parent: `${district.cities?.name}, ${district.cities?.provinces?.name}`
        });
      });

      // Encontrar el más cercano
      if (allLocations.length === 0) return null;

      const nearest = allLocations.reduce((prev, current) => 
        current.distance < prev.distance ? current : prev
      );

      console.log('Nearest location found:', nearest);
      return nearest;

    } catch (error) {
      console.error('Error finding nearest location:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { findNearestLocation, loading };
};

// Función para calcular distancia usando la fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
