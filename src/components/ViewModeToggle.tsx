
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
    <div className={cn("flex items-center bg-gray-100 p-1 rounded-lg", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className={cn(
          "h-8 w-8 p-0 rounded-md transition-all duration-200",
          viewMode === 'grid'
            ? "bg-white shadow-sm text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-white/50"
        )}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('list')}
        className={cn(
          "h-8 w-8 p-0 rounded-md transition-all duration-200",
          viewMode === 'list'
            ? "bg-white shadow-sm text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-white/50"
        )}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
