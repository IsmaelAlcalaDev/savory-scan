
import { Checkbox } from '@/components/ui/checkbox';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { Skeleton } from '@/components/ui/skeleton';

interface PriceFilterProps {
  selectedPriceRanges: string[];
  onPriceRangeChange: (priceRanges: string[]) => void;
}

export default function PriceFilter({ selectedPriceRanges, onPriceRangeChange }: PriceFilterProps) {
  const { priceRanges, loading, error } = usePriceRanges();

  const handlePriceToggle = (priceValue: string) => {
    const newSelected = selectedPriceRanges.includes(priceValue)
      ? selectedPriceRanges.filter(value => value !== priceValue)
      : [...selectedPriceRanges, priceValue];
    onPriceRangeChange(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-2">
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
            checked={selectedPriceRanges.includes(range.value)}
            onCheckedChange={() => handlePriceToggle(range.value)}
          />
          <label 
            htmlFor={`price-${range.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
          >
            {range.icon && <span>{range.icon}</span>}
            {range.display_text}
          </label>
        </div>
      ))}
    </div>
  );
}
