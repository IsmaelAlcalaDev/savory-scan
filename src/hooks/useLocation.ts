
import { useState, useCallback } from 'react';

export const useLocation = () => {
  const [currentLocationName, setCurrentLocationName] = useState('Ubicación actual');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For now, just set a default location
          // In a real app, you'd reverse geocode the coordinates
          setCurrentLocationName('Madrid, España');
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setCurrentLocationName('Ubicación no disponible');
          setIsLoadingLocation(false);
        }
      );
    } else {
      setCurrentLocationName('Geolocalización no soportada');
      setIsLoadingLocation(false);
    }
  }, []);

  return {
    currentLocationName,
    isLoadingLocation,
    getCurrentLocation
  };
};
