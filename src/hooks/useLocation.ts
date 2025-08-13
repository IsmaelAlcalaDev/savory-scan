
import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export const useLocation = () => {
  const [location, setLocationState] = useState<Location | null>(null);

  useEffect(() => {
    // Try to get location from localStorage first
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setLocationState(parsedLocation);
        return;
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    }

    // If no saved location, try to get precise GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get address from coordinates
          try {
            const response = await fetch(
              `https://api.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            
            const newLocation = {
              latitude,
              longitude,
              address: data.display_name || 'Ubicación detectada'
            };
            
            setLocationState(newLocation);
            localStorage.setItem('userLocation', JSON.stringify(newLocation));
          } catch (error) {
            console.error('Error getting address:', error);
            const newLocation = { latitude, longitude, address: 'Ubicación detectada' };
            setLocationState(newLocation);
            localStorage.setItem('userLocation', JSON.stringify(newLocation));
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
  };

  return { location, setLocation };
};
