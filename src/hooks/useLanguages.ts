
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Language {
  id: number;
  code: string;
  name: string;
  flag?: string | null;
  flag_url?: string | null;
  is_active: boolean;
}

export const useLanguages = () => {
  return useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('languages')
        .select('id, code, name, flag, flag_url, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching languages:', error);
        throw error;
      }

      return data as Language[];
    },
  });
};
