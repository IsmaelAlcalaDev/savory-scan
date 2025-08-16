
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Leaf } from 'lucide-react';

interface QuickFiltersProps {
  isOpenNow: boolean;
  onOpenNowChange: (value: boolean) => void;
  selectedPriceRanges: string[];
  onPriceRangeChange: (ranges: string[]) => void;
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
}

export default function QuickFilters({
  isOpenNow,
  onOpenNowChange,
  selectedPriceRanges,
  onPriceRangeChange,
  selectedDietTypes,
  onDietTypeChange
}: QuickFiltersProps) {
  const isBudgetFriendly = selectedPriceRanges.includes('€');
  const isVegetarianVegan = selectedDietTypes.length > 0;

  const handleBudgetFriendlyToggle = () => {
    if (isBudgetFriendly) {
      onPriceRangeChange(selectedPriceRanges.filter(range => range !== '€'));
    } else {
      onPriceRangeChange([...selectedPriceRanges, '€']);
    }
  };

  const handleVegetarianVeganToggle = () => {
    if (isVegetarianVegan) {
      onDietTypeChange([]);
    } else {
      // Add vegetarian and vegan diet type IDs (assuming 1 = vegetarian, 2 = vegan)
      onDietTypeChange([1, 2]);
    }
  };

  return (
    <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
      <Button
        variant={isOpenNow ? "default" : "outline"}
        size="sm"
        onClick={() => onOpenNowChange(!isOpenNow)}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Clock className="h-4 w-4" />
        Abierto ahora
      </Button>
      
      <Button
        variant={isBudgetFriendly ? "default" : "outline"}
        size="sm"
        onClick={handleBudgetFriendlyToggle}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <DollarSign className="h-4 w-4" />
        Económico
      </Button>
      
      <Button
        variant={isVegetarianVegan ? "default" : "outline"}
        size="sm"
        onClick={handleVegetarianVeganToggle}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Leaf className="h-4 w-4" />
        Vegetariano/Vegano
      </Button>
    </div>
  );
}
