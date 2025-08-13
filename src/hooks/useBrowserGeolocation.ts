
import { useEffect, useState } from 'react';

type GeoState = {
  loading: boolean;
  error: string | null;
  latitude: number | null;
  longitude: number | null;
};

export function useBrowserGeolocation() {
  const [state, setState] = useState<GeoState>({
    loading: true,
    error: null,
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({
        loading: false,
        error: 'Geolocation is not supported by this browser',
        latitude: null,
        longitude: null,
      });
      return;
    }

    const onSuccess = (pos: GeolocationPosition) => {
      setState({
        loading: false,
        error: null,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    };

    const onError = (err: GeolocationPositionError) => {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Geolocation error',
      }));
    };

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
