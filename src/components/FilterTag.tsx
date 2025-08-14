
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/use-mobile';

interface FilterTagProps {
  label: string;
  icon?: React.ReactNode;
  activeCount?: number;
  children: React.ReactNode;
  onClear?: () => void;
}

export default function FilterTag({ 
  label, 
  icon, 
  activeCount = 0, 
  children, 
  onClear 
}: FilterTagProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const TagButton = (
    <Button
      variant="outline"
      className={cn(
        "h-9 px-3 rounded-full border-gray-300 hover:border-primary/50 transition-colors relative flex items-center gap-2",
        activeCount > 0 && "border-primary bg-primary/5 text-primary"
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {activeCount > 0 && (
        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
          {activeCount}
        </Badge>
      )}
      <ChevronDown className="h-3 w-3 opacity-50" />
    </Button>
  );

  const FilterContent = (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base">{label}</h3>
        {activeCount > 0 && onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 px-2 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
      {children}
    </div>
  );

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {TagButton}
        </DialogTrigger>
        <DialogContent className="max-w-full h-[90vh] w-full m-0 rounded-t-lg rounded-b-none p-0 flex flex-col">
          <DialogHeader className="p-6 pb-0 flex-shrink-0">
            <DialogTitle className="text-left">{label}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-4">
            {FilterContent}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {TagButton}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 z-50 bg-white border shadow-lg" 
        align="start"
        side="top"
        sideOffset={8}
      >
        {FilterContent}
      </PopoverContent>
    </Popover>
  );
}
