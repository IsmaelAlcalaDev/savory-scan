
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VegModeToggleProps {
  isVegMode: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export default function VegModeToggle({ isVegMode, onToggle, className }: VegModeToggleProps) {
  const handleToggle = () => {
    const newVegMode = !isVegMode;
    onToggle(newVegMode);
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-sm font-medium text-muted-foreground">Modo VEG</span>
      <button
        onClick={handleToggle}
        className={cn(
          "relative inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 focus:outline-none",
          isVegMode 
            ? "bg-green-50 hover:bg-green-100 border border-green-200" 
            : "bg-muted/20 hover:bg-muted/40 border border-border"
        )}
      >
        <Leaf 
          className={cn(
            "h-4 w-4 transition-all duration-300",
            isVegMode 
              ? "text-green-600 fill-green-600 stroke-white stroke-[1.5]" 
              : "text-muted-foreground hover:text-foreground"
          )} 
        />
      </button>
    </div>
  );
}
