
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppSettings {
  logoUrl?: string;
  appName?: string;
}

export const useAppSettings = () => {
  return useQuery({
    queryKey: ['app_settings', 'branding'],
    queryFn: async (): Promise<AppSettings> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['branding.logo_url', 'branding.app_name'])
        .eq('is_public', true);

      if (error) {
        console.error('Error fetching app settings:', error);
        throw error;
      }

      const settings: AppSettings = {};
      data?.forEach((row: { key: string; value: any }) => {
        if (row.key === 'branding.logo_url') {
          settings.logoUrl = row.value?.url ?? undefined;
        } else if (row.key === 'branding.app_name') {
          settings.appName = row.value?.text ?? undefined;
        }
      });

      console.log('useAppSettings: Loaded settings', settings);
      return settings;
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};
