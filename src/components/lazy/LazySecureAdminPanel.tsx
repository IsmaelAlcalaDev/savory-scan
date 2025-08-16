
import { lazy } from 'react';

export const LazySecureAdminPanel = lazy(() => 
  import('../../pages/SecureAdminPanel').then(module => ({
    default: module.default
  }))
);
