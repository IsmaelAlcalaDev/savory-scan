
import { useState, useCallback } from 'react';
import { useNearestLocation } from './useNearestLocation';
import { useReverseGeocoding } from './useReverseGeocoding';
import { useIPLocation } from './useIPLocation';

interface LocationResult {
  latitude: number;
  longitude: number;
  name: string;
  type?: string;
  parent?: string;
  address: string;
  accuracy: 'gps' | 'ip';
}

export const useLocationDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { findNearestLocation } = useNearestLocation();
  const { reverseGeocode } = useReverseGeocoding();
  const { location: ipLocation } = useIPLocation();

  const detectLocation = useCallback(async (): Promise<LocationResult | null> => {
    setIsDetecting(true);
    setError(null);

    try {
      // Try GPS first
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 60000 // Cache for 1 minute
              }
            );
          });

          const { latitude, longitude } = position.coords;
          console.log('GPS location detected:', { latitude, longitude });

          // Get location details in parallel
          const [geocodeResult, nearestLocation] = await Promise.all([
            reverseGeocode(latitude, longitude).catch(() => null),
            findNearestLocation(latitude, longitude).catch(() => null)
          ]);

          let name = 'Ubicación GPS';
          let address = 'Ubicación detectada';

          if (nearestLocation) {
            name = nearestLocation.name;
            address = nearestLocation.parent ? `${nearestLocation.name}, ${nearestLocation.parent}` : nearestLocation.name;
          } else if (geocodeResult) {
            name = geocodeResult.localArea;
            address = geocodeResult.address;
          }

          return {
            latitude,
            longitude,
            name,
            type: nearestLocation?.type,
            parent: nearestLocation?.parent,
            address,
            accuracy: 'gps' as const
          };
        } catch (gpsError) {
          console.warn('GPS detection failed, falling back to IP location:', gpsError);
        }
      }

      // Fallback to IP location
      if (ipLocation) {
        console.log('Using IP location as fallback:', ipLocation);
        return {
          latitude: ipLocation.latitude,
          longitude: ipLocation.longitude,
          name: ipLocation.city,
          parent: `${ipLocation.region}, ${ipLocation.country}`,
          address: `${ipLocation.city}, ${ipLocation.region}`,
          accuracy: 'ip' as const
        };
      }

      throw new Error('No se pudo detectar la ubicación');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al detectar ubicación';
      setError(errorMessage);
      console.error('Location detection failed:', err);
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, [findNearestLocation, reverseGeocode, ipLocation]);

  return {
    detectLocation,
    isDetecting,
    error,
    hasIPFallback: !!ipLocation
  };
};
