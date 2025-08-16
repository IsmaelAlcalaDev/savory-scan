
import { useState, useEffect, useRef } from 'react';
import { useIPLocation } from './useIPLocation';

interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
  type?: string;
  parent?: string;
  address: string;
  method: 'gps' | 'ip' | 'manual' | 'cached';
}

interface UseSmartLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  locationReady: boolean;
  requestGPSLocation: () => Promise<void>;
  setManualLocation: (location: LocationData) => void;
  clearLocation: () => void;
}

const LOCATION_STORAGE_KEY = 'user_location_cache';
const LOCATION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useSmartLocation = (): UseSmartLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationReady, setLocationReady] = useState(false);
  
  const { location: ipLocation, loading: ipLoading } = useIPLocation();
  const gpsAttempted = useRef(false);
  const initializationDone = useRef(false);

  // Load cached location
  const loadCachedLocation = (): LocationData | null => {
    try {
      const cached = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > LOCATION_CACHE_DURATION;
        
        if (!isExpired && data.location) {
          console.log('useSmartLocation: Using cached location:', data.location);
          return { ...data.location, method: 'cached' };
        }
      }
    } catch (error) {
      console.error('Error loading cached location:', error);
    }
    return null;
  };

  // Save location to cache
  const saveLocationToCache = (locationData: LocationData) => {
    try {
      const cacheData = {
        location: locationData,
        timestamp: Date.now()
      };
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving location to cache:', error);
    }
  };

  // GPS location request with timeout
  const requestGPSLocation = async (): Promise<void> => {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocalización no disponible');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('GPS timeout'));
      }, 2000); // 2 second timeout

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const { latitude, longitude } = position.coords;
          
          const gpsLocation: LocationData = {
            latitude,
            longitude,
            name: 'Tu ubicación actual',
            address: 'Ubicación GPS',
            method: 'gps'
          };
          
          console.log('useSmartLocation: GPS location obtained:', gpsLocation);
          setLocation(gpsLocation);
          setLocationReady(true);
          setError(null);
          saveLocationToCache(gpsLocation);
          resolve();
        },
        (gpsError) => {
          clearTimeout(timeoutId);
          console.log('useSmartLocation: GPS error:', gpsError);
          reject(gpsError);
        },
        {
          enableHighAccuracy: true,
          timeout: 2000,
          maximumAge: 0
        }
      );
    });
  };

  // Set manual location
  const setManualLocation = (manualLocation: LocationData) => {
    const locationWithMethod = { ...manualLocation, method: 'manual' as const };
    setLocation(locationWithMethod);
    setLocationReady(true);
    setError(null);
    setLoading(false);
    saveLocationToCache(locationWithMethod);
    console.log('useSmartLocation: Manual location set:', locationWithMethod);
  };

  // Clear location
  const clearLocation = () => {
    setLocation(null);
    setLocationReady(false);
    setLoading(true);
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  };

  // Initialize location detection
  useEffect(() => {
    if (initializationDone.current) return;
    
    const initializeLocation = async () => {
      console.log('useSmartLocation: Initializing location detection...');
      
      // 1. Try cached location first
      const cached = loadCachedLocation();
      if (cached) {
        setLocation(cached);
        setLocationReady(true);
        setLoading(false);
        initializationDone.current = true;
        return;
      }

      // 2. Try GPS with timeout
      if (!gpsAttempted.current) {
        gpsAttempted.current = true;
        try {
          await requestGPSLocation();
          setLoading(false);
          initializationDone.current = true;
          return;
        } catch (gpsError) {
          console.log('useSmartLocation: GPS failed, waiting for IP fallback');
        }
      }

      // 3. Fall back to IP when available
      if (!ipLoading && ipLocation) {
        const ipLocationData: LocationData = {
          latitude: ipLocation.latitude,
          longitude: ipLocation.longitude,
          name: ipLocation.city,
          address: `${ipLocation.city}, ${ipLocation.region}`,
          method: 'ip'
        };
        
        console.log('useSmartLocation: Using IP location as fallback:', ipLocationData);
        setLocation(ipLocationData);
        setLocationReady(true);
        setError(null);
        saveLocationToCache(ipLocationData);
        initializationDone.current = true;
      }
      
      setLoading(ipLoading);
    };

    initializeLocation();
  }, [ipLocation, ipLoading]);

  return {
    location,
    loading,
    error,
    locationReady,
    requestGPSLocation,
    setManualLocation,
    clearLocation
  };
};
