
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlatformConfig {
  id: number;
  platform_key: string;
  platform_name: string;
  icon_name: string;
  icon_color?: string;
  base_url?: string;
  url_pattern?: string;
  category: 'social' | 'delivery' | 'booking' | 'review';
  display_order: number;
  is_active: boolean;
}

export const usePlatformConfigs = (category?: string) => {
  return useQuery({
    queryKey: ['platform_configs', category],
    queryFn: async (): Promise<PlatformConfig[]> => {
      let query = supabase
        .from('platform_configs')
        .select('*')
        .eq('is_active', true);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('display_order');

      if (error) {
        console.error('Error fetching platform configs:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};
