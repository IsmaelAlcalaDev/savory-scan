
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
          "relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none",
          isVegMode 
            ? "bg-gradient-to-r from-green-500 to-green-600" 
            : "bg-muted hover:bg-muted/80"
        )}
      >
        <div
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-sm",
            "flex items-center justify-center",
            isVegMode 
              ? "translate-x-7" 
              : "translate-x-1"
          )}
        >
          <Leaf 
            className={cn(
              "h-2.5 w-2.5 transition-all duration-300",
              isVegMode 
                ? "text-green-600" 
                : "text-muted-foreground"
            )} 
          />
        </div>
      </button>
    </div>
  );
}
