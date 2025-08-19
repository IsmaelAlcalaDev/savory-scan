
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MetricData {
  id: number;
  entity_type: string;
  entity_id: number;
  metric_type: string;
  metric_value: number;
  metric_data: Record<string, any>;
  metric_date: string;
  created_at: string;
}

interface UseMetricsProps {
  entityType: string;
  entityId: number;
  metricType?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export const useMetrics = ({
  entityType,
  entityId,
  metricType,
  dateRange
}: UseMetricsProps) => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('metrics')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('metric_date', { ascending: false });

        if (metricType) {
          query = query.eq('metric_type', metricType);
        }

        if (dateRange) {
          query = query
            .gte('metric_date', dateRange.from)
            .lte('metric_date', dateRange.to);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setMetrics(data || []);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar métricas');
        setMetrics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [entityType, entityId, metricType, dateRange]);

  const addMetric = async (newMetric: Omit<MetricData, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .insert([newMetric])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMetrics(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding metric:', err);
      throw err;
    }
  };

  return {
    metrics,
    loading,
    error,
    addMetric
  };
};
