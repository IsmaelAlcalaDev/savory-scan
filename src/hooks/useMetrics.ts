
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MetricData {
  id: string;
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

        // Use analytics_events as a fallback until metrics table types are available
        let query = supabase
          .from('analytics_events')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('created_at', { ascending: false });

        if (metricType) {
          query = query.eq('event_type', metricType);
        }

        if (dateRange) {
          query = query
            .gte('created_at', dateRange.from)
            .lte('created_at', dateRange.to);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Transform analytics_events data to match MetricData interface
        const transformedData: MetricData[] = (data || []).map((event: any) => ({
          id: event.id,
          entity_type: event.entity_type || entityType,
          entity_id: event.entity_id || entityId,
          metric_type: event.event_type,
          metric_value: 1, // Default value
          metric_data: event.properties || {},
          metric_date: event.created_at?.split('T')[0] || '',
          created_at: event.created_at
        }));

        setMetrics(transformedData);
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
      // Use analytics_events for now
      const { data, error } = await supabase
        .from('analytics_events')
        .insert([{
          entity_type: newMetric.entity_type,
          entity_id: newMetric.entity_id,
          event_type: newMetric.metric_type,
          properties: newMetric.metric_data
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Transform and add to state
      const transformedData: MetricData = {
        id: data.id,
        entity_type: data.entity_type || newMetric.entity_type,
        entity_id: data.entity_id || newMetric.entity_id,
        metric_type: data.event_type,
        metric_value: 1,
        metric_data: data.properties || {},
        metric_date: data.created_at?.split('T')[0] || '',
        created_at: data.created_at
      };

      setMetrics(prev => [transformedData, ...prev]);
      return transformedData;
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
