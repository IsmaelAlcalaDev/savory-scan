
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
          "relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 focus:outline-none border",
          isVegMode 
            ? "bg-green-50 hover:bg-green-100 border-green-200 shadow-sm" 
            : "bg-muted/30 hover:bg-muted/50 border-border"
        )}
      >
        <Leaf 
          className={cn(
            "h-5 w-5 transition-all duration-300",
            isVegMode 
              ? "text-green-600 fill-green-600 stroke-white stroke-[1.5]" 
              : "text-muted-foreground hover:text-foreground"
          )} 
        />
      </button>
    </div>
  );
}
