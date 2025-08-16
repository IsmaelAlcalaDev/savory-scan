
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routePreloadMap: Record<string, () => Promise<any>> = {
  '/restaurantes': () => import('../pages/Restaurants'),
  '/platos': () => import('../pages/Dishes'),
  '/restaurant': () => import('../pages/RestaurantProfile'),
  '/carta': () => import('../pages/RestaurantMenu'),
  '/admin': () => import('../pages/SecureAdminPanel'),
  '/superadmin': () => import('../pages/SuperAdminPanel'),
  '/security': () => import('../pages/SecurityDashboard'),
};

const preloadedRoutes = new Set<string>();

export const useRoutePreload = () => {
  const location = useLocation();

  const preloadRoute = (path: string) => {
    if (preloadedRoutes.has(path)) return;
    
    const preloadFn = routePreloadMap[path];
    if (preloadFn) {
      preloadFn().then(() => {
        preloadedRoutes.add(path);
        console.log(`Preloaded route: ${path}`);
      }).catch(err => {
        console.warn(`Failed to preload route ${path}:`, err);
      });
    }
  };

  const preloadRelatedRoutes = (currentPath: string) => {
    // Preload logic based on current route
    switch (true) {
      case currentPath === '/':
        preloadRoute('/restaurantes');
        preloadRoute('/platos');
        break;
      case currentPath === '/restaurantes':
        preloadRoute('/restaurant');
        preloadRoute('/platos');
        break;
      case currentPath === '/platos':
        preloadRoute('/carta');
        preloadRoute('/restaurantes');
        break;
      case currentPath.startsWith('/restaurant/'):
        preloadRoute('/carta');
        break;
    }
  };

  useEffect(() => {
    // Preload related routes after a short delay
    const timer = setTimeout(() => {
      preloadRelatedRoutes(location.pathname);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return { preloadRoute };
};
