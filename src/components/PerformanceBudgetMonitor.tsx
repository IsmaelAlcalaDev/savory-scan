
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { useRealUserMonitoring } from '@/hooks/useRealUserMonitoring';

interface PerformanceBudget {
  metric: string;
  budget: number;
  current: number;
  unit: string;
  critical: boolean;
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
  const { metrics } = useRealUserMonitoring(enabled);

  const performanceBudgets: Record<string, { budget: number; unit: string; critical: boolean }> = {
    largestContentfulPaint: { budget: 2500, unit: 'ms', critical: true },
    firstInputDelay: { budget: 100, unit: 'ms', critical: true },
    cumulativeLayoutShift: { budget: 0.1, unit: '', critical: true },
    firstContentfulPaint: { budget: 1800, unit: 'ms', critical: false },
    timeToInteractive: { budget: 5000, unit: 'ms', critical: false },
    totalBlockingTime: { budget: 300, unit: 'ms', critical: false }
  };

  const updateBudgets = useCallback(() => {
    const updatedBudgets: PerformanceBudget[] = [];
    const newViolations: string[] = [];

    Object.entries(performanceBudgets).forEach(([metric, config]) => {
      const current = metrics[metric as keyof typeof metrics] || 0;
      const budget: PerformanceBudget = {
        metric,
        budget: config.budget,
        current,
        unit: config.unit,
        critical: config.critical
      };

      updatedBudgets.push(budget);

      // Check for violations
      if (current > config.budget) {
        newViolations.push(metric);
        
        // Log critical violations
        if (config.critical) {
          console.warn(`🚨 CRITICAL Performance Budget Violation: ${metric}`, {
            current,
            budget: config.budget,
            violation: ((current - config.budget) / config.budget * 100).toFixed(1) + '%'
          });
        }
      }
    });

    setBudgets(updatedBudgets);
    setViolations(newViolations);
  }, [metrics]);

  useEffect(() => {
    if (!enabled) return;
    updateBudgets();
  }, [enabled, updateBudgets]);

  // Send violations to analytics
  useEffect(() => {
    if (violations.length === 0) return;

    const sendViolations = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Convert complex objects to JSON-compatible format
        const simplifiedBudgets = budgets
          .filter(b => violations.includes(b.metric))
          .map(b => ({
            metric: b.metric,
            budget: b.budget,
            current: b.current,
            unit: b.unit,
            critical: b.critical
          }));
        
        await supabase.from('analytics_events').insert({
          event_type: 'performance',
          event_name: 'budget_violations',
          properties: {
            violations,
            budgets: simplifiedBudgets,
            timestamp: Date.now(),
            url: window.location.pathname
          }
        });
      } catch (error) {
        console.warn('Failed to log performance violations:', error);
      }
    };

    sendViolations();
  }, [violations, budgets]);

  if (!enabled || budgets.length === 0) return null;

  const criticalViolations = violations.filter(v => 
    performanceBudgets[v]?.critical
  ).length;

  const getBudgetStatus = (budget: PerformanceBudget) => {
    if (budget.current === 0) return 'measuring';
    if (budget.current <= budget.budget * 0.8) return 'excellent';
    if (budget.current <= budget.budget) return 'good';
    if (budget.current <= budget.budget * 1.2) return 'warning';
    return 'critical';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-3 h-3 text-red-600" />;
      default:
        return <TrendingUp className="w-3 h-3 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms') return Math.round(value) + 'ms';
    return value.toFixed(3);
  };

  return (
    <Card className={`${className} bg-background/95 border-dashed`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          Performance Budgets
          {criticalViolations > 0 && (
            <Badge variant="destructive" className="text-xs px-1 py-0">
              {criticalViolations} Critical
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {budgets.map((budget) => {
          const status = getBudgetStatus(budget);
          const percentage = budget.current > 0 ? (budget.current / budget.budget) * 100 : 0;
          
          return (
            <div key={budget.metric} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {getStatusIcon(status)}
                  <span className="font-mono uppercase text-xs">
                    {budget.metric.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">
                    {formatValue(budget.current, budget.unit)} / {formatValue(budget.budget, budget.unit)}
                  </span>
                  <Badge 
                    variant={getStatusColor(status)} 
                    className="text-xs px-1 py-0"
                  >
                    {percentage.toFixed(0)}%
                  </Badge>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    status === 'excellent' || status === 'good' ? 'bg-green-500' :
                    status === 'warning' ? 'bg-yellow-500' :
                    status === 'critical' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, percentage)}%` 
                  }}
                />
              </div>
            </div>
          );
        })}
        
        {violations.length > 0 && (
          <div className="mt-2 p-2 bg-destructive/10 rounded text-xs">
            <div className="font-medium text-destructive mb-1">Budget Violations:</div>
            <div className="text-muted-foreground">
              {violations.map(v => v.replace(/([A-Z])/g, ' $1').trim()).join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
