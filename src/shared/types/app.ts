
export type AppType = 'client' | 'restaurant' | 'admin';

export interface AppConfig {
  name: string;
  basePath: string;
  requiredRole?: 'user' | 'moderator' | 'admin';
}

export const APP_CONFIGS: Record<AppType, AppConfig> = {
  client: {
    name: 'Cliente',
    basePath: '/',
    requiredRole: 'user'
  },
  restaurant: {
    name: 'Panel Restaurante',
    basePath: '/restaurant-panel',
    requiredRole: 'moderator'
  },
  admin: {
    name: 'Super Admin',
    basePath: '/admin',
    requiredRole: 'admin'
  }
};
