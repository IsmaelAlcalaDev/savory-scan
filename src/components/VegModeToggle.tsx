
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
          "relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
          isVegMode 
            ? "bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25" 
            : "bg-gray-300 hover:bg-gray-400"
        )}
      >
        <div
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg",
            "flex items-center justify-center",
            isVegMode 
              ? "translate-x-6 shadow-green-500/25" 
              : "translate-x-0.5"
          )}
        >
          <Leaf 
            className={cn(
              "h-3 w-3 transition-all duration-300",
              isVegMode 
                ? "text-green-600 scale-100" 
                : "text-gray-400 scale-75"
            )} 
          />
        </div>
      </button>
    </div>
  );
}
