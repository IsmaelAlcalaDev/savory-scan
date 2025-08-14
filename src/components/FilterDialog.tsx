
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import SortFilter from './SortFilter';
import DistanceFilter from './DistanceFilter';

interface FilterDialogProps {
  filterType: 'sort' | 'distance' | 'price' | 'rating' | 'establishment' | 'diet' | 'schedule';
  filterLabel: string;
  children: React.ReactNode;
  selectedSort?: string;
  selectedDistances?: number[];
  onSortChange?: (sortId: string) => void;
  onDistanceChange?: (distances: number[]) => void;
  onApply?: () => void;
  onReset?: () => void;
}

export default function FilterDialog({
  filterType,
  filterLabel,
  children,
  selectedSort,
  selectedDistances = [],
  onSortChange = () => {},
  onDistanceChange = () => {},
  onApply = () => {},
  onReset = () => {}
}: FilterDialogProps) {
  const isMobile = useIsMobile();
  const isTablet = !isMobile && window.innerWidth < 1024;
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onApply();
    setOpen(false);
  };

  const handleReset = () => {
    onReset();
    if (filterType === 'sort') {
      onSortChange('relevance');
    } else if (filterType === 'distance') {
      onDistanceChange([]);
    }
  };

  const renderFilterContent = () => {
    switch (filterType) {
      case 'sort':
        return (
          <SortFilter
            selectedSort={selectedSort}
            onSortChange={onSortChange}
          />
        );
      case 'distance':
        return (
          <DistanceFilter
            selectedDistances={selectedDistances}
            onDistanceChange={onDistanceChange}
          />
        );
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <p>Filtros de {filterLabel.toLowerCase()} próximamente disponibles</p>
          </div>
        );
    }
  };

  const FilterContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4">
        {renderFilterContent()}
      </div>
      
      <div className="flex gap-3 pt-4 border-t">
        <Button 
          onClick={handleReset}
          variant="outline" 
          className="flex-1"
        >
          Restablecer
        </Button>
        <Button 
          onClick={handleApply}
          className="flex-1"
        >
          Aplicar filtros
        </Button>
      </div>
    </div>
  );

  if (isMobile || isTablet) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>{filterLabel}</SheetTitle>
          </SheetHeader>
          <FilterContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{filterLabel}</DialogTitle>
        </DialogHeader>
        <FilterContent />
      </DialogContent>
    </Dialog>
  );
}
