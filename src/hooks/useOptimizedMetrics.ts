
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MetricsSummary {
  totalMetrics: number;
  latestMetrics: Array<{
    entity_type: string;
    entity_id: number;
    metric_type: string;
    metric_value: number;
    metric_date: string;
  }>;
  entityTypes: string[];
}

export const useOptimizedMetrics = () => {
  const [loading, setLoading] = useState(false);

  const getMetricsSummary = useCallback(async (): Promise<MetricsSummary> => {
    try {
      setLoading(true);

      // Get total count
      const { count } = await supabase
        .from('metrics')
        .select('*', { count: 'exact', head: true });

      // Get latest metrics
      const { data: latestMetrics } = await supabase
        .from('metrics')
        .select('entity_type, entity_id, metric_type, metric_value, metric_date')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get entity types
      const { data: entityTypesData } = await supabase
        .from('metrics')
        .select('entity_type')
        .group('entity_type');

      return {
        totalMetrics: count || 0,
        latestMetrics: latestMetrics || [],
        entityTypes: entityTypesData?.map(item => item.entity_type) || []
      };
    } catch (err) {
      console.error('Error fetching metrics summary:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackMetric = useCallback(async (
    entityType: string,
    entityId: number,
    metricType: string,
    metricValue: number,
    metricData: Record<string, any> = {}
  ) => {
    try {
      const { error } = await supabase
        .from('metrics')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          metric_type: metricType,
          metric_value: metricValue,
          metric_data: metricData,
          metric_date: new Date().toISOString().split('T')[0]
        });

      if (error) {
        throw error;
      }

      console.log(`Metric tracked: ${entityType}:${entityId} - ${metricType}:${metricValue}`);
    } catch (err) {
      console.error('Error tracking metric:', err);
      // Non-blocking error - don't throw to avoid breaking user experience
    }
  }, []);

  return {
    getMetricsSummary,
    trackMetric,
    loading
  };
};
