
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceBudget {
  metric: string;
  budget: number;
  actual: number;
  unit: string;
}

interface PerformanceBudgetMonitorProps {
  enabled?: boolean;
  className?: string;
}

export default function PerformanceBudgetMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  className 
}: PerformanceBudgetMonitorProps) {
  const [budgets, setBudgets] = useState<PerformanceBudget[]>([]);
  const [violations, setViolations] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const checkBudgets = () => {
      const newBudgets: PerformanceBudget[] = [];
      const newViolations: string[] = [];

      // Core Web Vitals budgets
      const performanceEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (performanceEntries.length > 0) {
        const nav = performanceEntries[0];
        
        // LCP Budget: 2.5s
        const lcp = nav.loadEventEnd - nav.fetchStart;
        newBudgets.push({
          metric: 'LCP',
          budget: 2500,
          actual: lcp,
          unit: 'ms'
        });
        if (lcp > 2500) newViolations.push('LCP');

        // FCP Budget: 1.8s
        const fcp = nav.domContentLoadedEventEnd - nav.fetchStart;
        newBudgets.push({
          metric: 'FCP',
          budget: 1800,
          actual: fcp,
          unit: 'ms'
        });
        if (fcp > 1800) newViolations.push('FCP');

        // TTFB Budget: 600ms
        const ttfb = nav.responseStart - nav.requestStart;
        newBudgets.push({
          metric: 'TTFB',
          budget: 600,
          actual: ttfb,
          unit: 'ms'
        });
        if (ttfb > 600) newViolations.push('TTFB');
      }

      setBudgets(newBudgets);
      setViolations(newViolations);

      // Log violations to analytics (non-blocking)
      if (newViolations.length > 0) {
        logBudgetViolations(newViolations, newBudgets).catch(console.warn);
      }
    };

    // Check budgets after page load
    if (document.readyState === 'complete') {
      setTimeout(checkBudgets, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkBudgets, 1000);
      });
    }
  }, [enabled]);

  const logBudgetViolations = async (violations: string[], budgets: PerformanceBudget[]) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      await supabase.from('analytics_events').insert({
        event_type: 'performance',
        event_name: 'budget_violation',
        properties: {
          violations,
          budgets: budgets.map(b => ({
            metric: b.metric,
            budget: b.budget,
            actual: b.actual,
            unit: b.unit
          })),
          timestamp: Date.now(),
          url: window.location.pathname
        }
      });
    } catch (error) {
      console.warn('Failed to log budget violations:', error);
    }
  };

  if (!enabled || budgets.length === 0) return null;

  const getBudgetStatus = (budget: PerformanceBudget) => {
    const ratio = budget.actual / budget.budget;
    if (ratio <= 1) return 'good';
    if (ratio <= 1.2) return 'warning';
    return 'violation';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'default';
      case 'warning': return 'secondary';
      case 'violation': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'violation': return AlertTriangle;
      default: return Activity;
    }
  };

  return (
    <Card className={`${className} bg-background/90 border-dashed`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <Activity className="w-3 h-3" />
          Performance Budget Monitor
          {violations.length > 0 && (
            <Badge variant="destructive" className="text-xs px-1 py-0">
              {violations.length} violations
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {budgets.map((budget) => {
          const status = getBudgetStatus(budget);
          const StatusIcon = getStatusIcon(status);
          
          return (
            <div key={budget.metric} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <StatusIcon className="w-3 h-3" />
                <span className="font-mono">{budget.metric}:</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">
                  {Math.round(budget.actual)}{budget.unit}
                </span>
                <span className="text-muted-foreground">/</span>
                <Badge 
                  variant={getStatusColor(status)}
                  className="text-xs px-1 py-0"
                >
                  {budget.budget}{budget.unit}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
