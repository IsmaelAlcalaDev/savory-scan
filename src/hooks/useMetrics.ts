
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MetricData {
  date: string;
  value: number;
  change?: number;
  metadata?: Record<string, any>;
}

export interface MetricsSummary {
  total: number;
  today: number;
  week: number;
  month: number;
  change_24h?: number;
  change_7d?: number;
  change_30d?: number;
}

interface UseMetricsOptions {
  entityType?: string;
  entityId?: number;
  metricType?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const useMetrics = (options: UseMetricsOptions = {}) => {
  const [data, setData] = useState<MetricData[]>([]);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching metrics with options:', options);

        // Since we don't have the unified metrics table yet, 
        // we'll use analytics_events as a fallback
        let query = supabase
          .from('analytics_events')
          .select('*');

        // Apply filters based on options
        if (options.entityType) {
          query = query.eq('entity_type', options.entityType);
        }

        if (options.entityId) {
          query = query.eq('entity_id', options.entityId);
        }

        if (options.metricType) {
          query = query.eq('event_type', options.metricType);
        }

        if (options.dateRange) {
          query = query
            .gte('created_at', options.dateRange.start.toISOString())
            .lte('created_at', options.dateRange.end.toISOString());
        }

        // Limit results for performance
        query = query.limit(1000);

        const { data: analyticsData, error: fetchError } = await query;

        if (fetchError) {
          console.error('Error fetching analytics events:', fetchError);
          throw fetchError;
        }

        console.log('Analytics events fetched:', analyticsData?.length || 0);

        if (!analyticsData || analyticsData.length === 0) {
          setData([]);
          setSummary({
            total: 0,
            today: 0,
            week: 0,
            month: 0
          });
          return;
        }

        // Transform analytics events to metrics format
        const metricsData: MetricData[] = [];
        const dailyData = new Map<string, number>();

        analyticsData.forEach(event => {
          if (!event.created_at) return;
          
          const date = new Date(event.created_at).toISOString().split('T')[0];
          const currentCount = dailyData.get(date) || 0;
          dailyData.set(date, currentCount + 1);

          // Parse properties safely
          let metadata: Record<string, any> = {};
          if (event.properties && typeof event.properties === 'object' && !Array.isArray(event.properties)) {
            try {
              metadata = event.properties as Record<string, any>;
            } catch (e) {
              console.warn('Failed to parse event properties:', e);
            }
          }
        });

        // Convert daily data to metrics format
        Array.from(dailyData.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([date, count]) => {
            metricsData.push({
              date,
              value: count,
              metadata: {}
            });
          });

        setData(metricsData);

        // Calculate summary statistics
        const total = analyticsData.length;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const todayCount = analyticsData.filter(event => 
          event.created_at && new Date(event.created_at) >= today
        ).length;

        const weekCount = analyticsData.filter(event => 
          event.created_at && new Date(event.created_at) >= weekAgo
        ).length;

        const monthCount = analyticsData.filter(event => 
          event.created_at && new Date(event.created_at) >= monthAgo
        ).length;

        setSummary({
          total,
          today: todayCount,
          week: weekCount,
          month: monthCount
        });

      } catch (err) {
        console.error('Error in useMetrics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [JSON.stringify(options)]);

  return {
    data,
    summary,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Re-trigger the effect by updating a dependency
    }
  };
};
