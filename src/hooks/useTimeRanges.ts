
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TimeRange {
  id: number;
  name: string;
  display_text: string;
  start_time: string;
  end_time: string;
  icon?: string;
}

export const useTimeRanges = () => {
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeRanges = async () => {
      try {
        setLoading(true);
        console.log('Fetching time ranges...');
        
        const { data, error: fetchError } = await supabase
          .from('time_ranges')
          .select('id, name, display_text, start_time, end_time, icon')
          .eq('is_active', true)
          .order('display_order');

        if (fetchError) {
          console.error('Supabase error fetching time ranges:', fetchError);
          setError('Error al cargar horarios');
          setTimeRanges([]);
          return;
        }
        
        console.log('Raw time ranges data:', data);
        setTimeRanges(data || []);
      } catch (err) {
        console.error('Error fetching time ranges:', err);
        setError('Error al cargar horarios');
        setTimeRanges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeRanges();
  }, []);

  return { timeRanges, loading, error };
};
