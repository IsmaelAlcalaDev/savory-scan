
import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewModeToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  className?: string;
}

export default function ViewModeToggle({ viewMode, onViewModeChange, className }: ViewModeToggleProps) {
  return (
    <div className={cn("flex items-center bg-white border border-gray-200 shadow-sm p-1 rounded-lg", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className={cn(
          "h-9 w-9 p-0 rounded-md transition-all duration-200 border",
          viewMode === 'grid'
            ? "bg-primary text-primary-foreground shadow-sm border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-gray-50 border-transparent"
        )}
        title="Vista en cuadrícula"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('list')}
        className={cn(
          "h-9 w-9 p-0 rounded-md transition-all duration-200 border",
          viewMode === 'list'
            ? "bg-primary text-primary-foreground shadow-sm border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-gray-50 border-transparent"
        )}
        title="Vista en lista"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
