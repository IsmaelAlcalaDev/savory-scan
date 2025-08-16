
import { lazy } from 'react';

export const LazyRestaurantProfile = lazy(() => 
  import('../../pages/RestaurantProfile').then(module => ({
    default: module.default
  }))
);
