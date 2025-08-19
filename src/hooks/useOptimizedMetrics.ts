
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

      // Get total count from analytics_events
      const { count } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true });

      // Get latest events
      const { data: latestEvents } = await supabase
        .from('analytics_events')
        .select('entity_type, entity_id, event_type, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get distinct entity types
      const { data: entityTypesData } = await supabase
        .from('analytics_events')
        .select('entity_type')
        .order('entity_type');

      // Remove duplicates manually since .group() is not available
      const uniqueEntityTypes = Array.from(
        new Set(entityTypesData?.map(item => item.entity_type).filter(Boolean))
      );

      // Transform latest events to match expected format
      const latestMetrics = (latestEvents || []).map(event => ({
        entity_type: event.entity_type || '',
        entity_id: event.entity_id || 0,
        metric_type: event.event_type || '',
        metric_value: 1,
        metric_date: event.created_at?.split('T')[0] || ''
      }));

      return {
        totalMetrics: count || 0,
        latestMetrics,
        entityTypes: uniqueEntityTypes
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
        .from('analytics_events')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          event_type: metricType,
          properties: { 
            ...metricData, 
            metric_value: metricValue 
          }
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
