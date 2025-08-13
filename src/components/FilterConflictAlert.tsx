
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface FilterConflict {
  type: 'warning' | 'error';
  message: string;
  conflictingFilters: string[];
}

interface FilterConflictAlertProps {
  conflicts: FilterConflict[];
  onDismiss?: () => void;
  onResolve?: (conflictingFilters: string[]) => void;
}

export default function FilterConflictAlert({ 
  conflicts, 
  onDismiss, 
  onResolve 
}: FilterConflictAlertProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="space-y-2">
      {conflicts.map((conflict, index) => (
        <Alert 
          key={index} 
          className={`border-l-4 ${
            conflict.type === 'error' 
              ? 'border-l-red-500 bg-red-50' 
              : 'border-l-amber-500 bg-amber-50'
          }`}
        >
          <AlertTriangle className={`h-4 w-4 ${
            conflict.type === 'error' ? 'text-red-500' : 'text-amber-500'
          }`} />
          
          <div className="flex-1">
            <AlertDescription className="text-sm">
              {conflict.message}
            </AlertDescription>
          </div>

          <div className="flex gap-2 ml-4">
            {onResolve && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResolve(conflict.conflictingFilters)}
                className="text-xs"
              >
                Resolver
              </Button>
            )}
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="p-1 h-auto"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </Alert>
      ))}
    </div>
  );
}
