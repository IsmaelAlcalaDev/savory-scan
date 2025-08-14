
import { useState } from 'react';
import { ChevronDown, DollarSign } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { Skeleton } from '@/components/ui/skeleton';

interface PriceRangeFilterProps {
  selectedPriceRanges: string[];
  onPriceRangeChange: (priceRanges: string[]) => void;
}

export default function PriceRangeFilter({ selectedPriceRanges, onPriceRangeChange }: PriceRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { priceRanges, loading, error } = usePriceRanges();

  const handlePriceRangeToggle = (rangeSymbol: string) => {
    const newSelected = selectedPriceRanges.includes(rangeSymbol)
      ? selectedPriceRanges.filter(symbol => symbol !== rangeSymbol)
      : [...selectedPriceRanges, rangeSymbol];
    onPriceRangeChange(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading price ranges:', error);
    return null;
  }

  return (
    <div className="space-y-3">
      {priceRanges.map((range) => (
        <div key={range.id} className="flex items-center space-x-2">
          <Checkbox 
            id={`price-${range.id}`}
            checked={selectedPriceRanges.includes(range.symbol)}
            onCheckedChange={() => handlePriceRangeToggle(range.symbol)}
          />
          <label 
            htmlFor={`price-${range.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
          >
            <span>{range.symbol}</span>
            {range.display_text}
          </label>
        </div>
      ))}
    </div>
  );
}
