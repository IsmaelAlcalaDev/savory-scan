
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import FoodieSpotLayout from '@/components/FoodieSpotLayout';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

export default function FoodieSpot() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { openAuthModal } = useAuthModal();
  const { user, loading: authLoading } = useEnhancedAuth();
  
  // Get location from state or localStorage
  const [userLocation, setUserLocation] = useState(() => {
    if (location.state?.location) {
      return location.state.location;
    }
    
    const saved = localStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : null;
  });

  // Redirect to location entry if no location is set
  useEffect(() => {
    if (!authLoading && !userLocation) {
      navigate('/location-entry', { replace: true });
    }
  }, [userLocation, navigate, authLoading]);

  // If no location is available, don't render anything (redirect will handle it)
  if (!userLocation) {
    return null;
  }

  return (
    <FoodieSpotLayout
      userLocation={userLocation}
      onLocationChange={setUserLocation}
    />
  );
}
