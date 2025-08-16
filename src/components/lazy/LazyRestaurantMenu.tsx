
import { lazy } from 'react';

export const LazyRestaurantMenu = lazy(() => 
  import('../../pages/RestaurantMenu').then(module => ({
    default: module.default
  }))
);
