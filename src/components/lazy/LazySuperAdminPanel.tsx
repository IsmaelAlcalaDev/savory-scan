
import { lazy } from 'react';

export const LazySuperAdminPanel = lazy(() => 
  import('../../pages/SuperAdminPanel').then(module => ({
    default: module.default
  }))
);
