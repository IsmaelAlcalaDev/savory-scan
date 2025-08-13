
import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { FilterValidation, FilterConflict } from '@/types/filters';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterStateIndicatorProps {
  validation: FilterValidation;
  className?: string;
}

export function FilterStateIndicator({ validation, className }: FilterStateIndicatorProps) {
  if (!validation.hasConflicts) return null;

  const getConflictIcon = (type: FilterConflict['type']) => {
    switch (type) {
      case 'override':
        return <Info className="h-3 w-3" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3" />;
      case 'disable':
        return <X className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getConflictVariant = (type: FilterConflict['type']) => {
    switch (type) {
      case 'override':
        return 'secondary';
      case 'warning':
        return 'destructive';
      case 'disable':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {validation.conflicts.map((conflict, index) => (
        <Badge 
          key={index}
          variant={getConflictVariant(conflict.type)}
          className="flex items-center gap-2 text-xs"
        >
          {getConflictIcon(conflict.type)}
          <span>{conflict.message}</span>
        </Badge>
      ))}
    </div>
  );
}

export function FilterStatusBadge({ 
  hasActiveFilters, 
  conflictCount 
}: { 
  hasActiveFilters: boolean;
  conflictCount: number;
}) {
  if (!hasActiveFilters && conflictCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {hasActiveFilters && (
        <Badge variant="default" className="text-xs">
          Filtros activos
        </Badge>
      )}
      {conflictCount > 0 && (
        <Badge variant="secondary" className="text-xs flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {conflictCount} conflicto{conflictCount > 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}
