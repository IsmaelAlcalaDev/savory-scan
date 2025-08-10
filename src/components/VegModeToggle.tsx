
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VegModeToggleProps {
  isVegMode: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export default function VegModeToggle({ isVegMode, onToggle, className }: VegModeToggleProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-sm font-medium text-muted-foreground">Modo VEG</span>
      <button
        onClick={() => onToggle(!isVegMode)}
        className={cn(
          "relative inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 focus:outline-none hover:bg-muted/50",
          isVegMode && "bg-green-50 hover:bg-green-100"
        )}
      >
        <Leaf 
          className={cn(
            "h-5 w-5 transition-all duration-300",
            isVegMode 
              ? "text-green-600 fill-green-600" 
              : "text-muted-foreground hover:text-foreground"
          )} 
        />
      </button>
    </div>
  );
}
