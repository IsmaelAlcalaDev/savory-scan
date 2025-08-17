
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Leaf } from 'lucide-react';
import { useState } from 'react';
import DietFilter from './DietFilter';
import { useAnalytics } from '@/hooks/useAnalytics';

interface DietFilterButtonProps {
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
}

export default function DietFilterButton({ selectedDietTypes, onDietTypeChange }: DietFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { trackFilterToggle } = useAnalytics();

  const handleDietTypeChange = (types: number[]) => {
    // Track filter changes
    const previousCount = selectedDietTypes.length;
    const newCount = types.length;
    
    if (newCount > previousCount) {
      trackFilterToggle('diet_filter', 'diet_types', true);
    } else if (newCount < previousCount) {
      trackFilterToggle('diet_filter', 'diet_types', false);
    }
    
    onDietTypeChange(types);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`flex-shrink-0 rounded-full text-sm px-4 py-2 h-8 border-0 ${
            selectedDietTypes.length > 0
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-100 hover:bg-red-500 hover:text-white text-gray-700'
          }`}
          data-analytics-action="filter-open"
          data-analytics-filter="diet"
        >
          <Leaf className="h-3 w-3 mr-1" />
          Dieta
          {selectedDietTypes.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 w-4 rounded-full p-0 text-xs bg-white text-red-500">
              {selectedDietTypes.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Filtrar por Tipo de Dieta
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona los tipos de dieta que prefieres
          </p>
          <DietFilter
            selectedDietTypes={selectedDietTypes}
            onDietTypeChange={handleDietTypeChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
