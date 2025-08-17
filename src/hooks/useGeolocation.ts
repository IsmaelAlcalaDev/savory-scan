
import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
}

interface UseGeolocationReturn {
  location: GeolocationState | null;
  loading: boolean;
  error: string | null;
  enableLocation: () => Promise<boolean>;
  disableLocation: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<GeolocationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enableLocation = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return false;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
          resolve(true);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  };

  const disableLocation = () => {
    setLocation(null);
    setError(null);
  };

  return {
    location,
    loading,
    error,
    enableLocation,
    disableLocation,
  };
};
