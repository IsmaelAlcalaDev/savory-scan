
import { lazy } from 'react';

export const LazySecurityDashboard = lazy(() => 
  import('../../pages/SecurityDashboard').then(module => ({
    default: module.default
  }))
);
