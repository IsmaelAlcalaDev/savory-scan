
import { useState } from 'react';

interface GeocodeResult {
  address: string;
  city?: string;
  district?: string;
  country?: string;
}

export const useReverseGeocoding = () => {
  const [loading, setLoading] = useState(false);

  const reverseGeocode = async (latitude: number, longitude: number): Promise<GeocodeResult | null> => {
    setLoading(true);
    try {
      // Usar Nominatim de OpenStreetMap para geocodificación inversa (gratuito)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`
      );
      
      if (!response.ok) {
        throw new Error('Error en la geocodificación');
      }

      const data = await response.json();
      
      if (data && data.display_name) {
        // Extraer componentes de la dirección
        const address = data.display_name;
        const city = data.address?.city || data.address?.town || data.address?.municipality;
        const district = data.address?.suburb || data.address?.neighbourhood;
        const country = data.address?.country;

        return {
          address,
          city,
          district,
          country
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { reverseGeocode, loading };
};
