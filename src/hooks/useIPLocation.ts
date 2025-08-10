
import { useState, useEffect } from 'react';

interface IPLocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  accuracy: 'ip'; // Para distinguir de GPS
}

export const useIPLocation = () => {
  const [location, setLocation] = useState<IPLocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectIPLocation = async () => {
      try {
        console.log('Detecting user location by IP...');
        
        // Usar ipapi.co que es gratuito y confiable
        const response = await fetch('https://ipapi.co/json/');
        
        if (!response.ok) {
          throw new Error('Error al obtener ubicación por IP');
        }

        const data = await response.json();
        
        if (data.latitude && data.longitude) {
          const locationData: IPLocationData = {
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            city: data.city || 'Ciudad desconocida',
            region: data.region || '',
            country: data.country_name || 'País desconocido',
            accuracy: 'ip'
          };
          
          console.log('IP location detected:', locationData);
          setLocation(locationData);
        } else {
          throw new Error('No se pudo obtener coordenadas válidas');
        }
      } catch (err) {
        console.error('Error detecting IP location:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        
        // Fallback: usar ubicación por defecto (Madrid, España)
        setLocation({
          latitude: 40.4168,
          longitude: -3.7038,
          city: 'Madrid',
          region: 'Comunidad de Madrid',
          country: 'España',
          accuracy: 'ip'
        });
      } finally {
        setLoading(false);
      }
    };

    detectIPLocation();
  }, []);

  return { location, loading, error };
};
