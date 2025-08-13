
import { AppType, APP_CONFIGS } from '@/shared/types/app';

export const detectCurrentApp = (): AppType => {
  const path = window.location.pathname;
  
  if (path.startsWith('/admin')) {
    return 'admin';
  } else if (path.startsWith('/restaurant-panel')) {
    return 'restaurant';
  } else {
    return 'client';
  }
};

export const getAppConfig = (appType?: AppType) => {
  const currentApp = appType || detectCurrentApp();
  return APP_CONFIGS[currentApp];
};

export const navigateToApp = (appType: AppType, path: string = '/') => {
  const config = APP_CONFIGS[appType];
  const fullPath = config.basePath === '/' ? path : `${config.basePath}${path}`;
  window.location.href = fullPath;
};
