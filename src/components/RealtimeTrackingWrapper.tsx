
import React, { useRef, useEffect } from 'react';

interface RealtimeTrackingWrapperProps {
  children: React.ReactNode;
  restaurantId?: number;
  dishId?: number;
  className?: string;
  onElementReady?: (element: HTMLElement) => void;
}

export const RealtimeTrackingWrapper: React.FC<RealtimeTrackingWrapperProps> = ({
  children,
  restaurantId,
  dishId,
  className = '',
  onElementReady
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current && onElementReady) {
      onElementReady(elementRef.current);
    }
  }, [onElementReady]);

  const dataAttributes: Record<string, string> = {};
  
  if (restaurantId) {
    dataAttributes['data-restaurant-id'] = restaurantId.toString();
  }
  
  if (dishId) {
    dataAttributes['data-dish-id'] = dishId.toString();
    // Also add restaurant ID if we can extract it from context
    const restaurantElement = document.querySelector(`[data-dish-id="${dishId}"]`);
    const restaurantIdFromContext = restaurantElement?.getAttribute('data-restaurant-id');
    if (restaurantIdFromContext) {
      dataAttributes['data-restaurant-id'] = restaurantIdFromContext;
    }
  }

  return (
    <div
      ref={elementRef}
      className={className}
      {...dataAttributes}
    >
      {children}
    </div>
  );
};
