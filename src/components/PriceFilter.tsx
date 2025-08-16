
import { Checkbox } from '@/components/ui/checkbox';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { Skeleton } from '@/components/ui/skeleton';
import { useCallback, memo } from 'react';

interface PriceFilterProps {
  selectedPriceRanges: string[];
  onPriceRangeChange: (priceRanges: string[]) => void;
}

const PriceFilterOption = memo(({ 
  range, 
  isChecked, 
  onToggle 
}: { 
  range: any; 
  isChecked: boolean; 
  onToggle: (value: string) => void;
}) => {
  const handleChange = useCallback(() => {
    onToggle(range.value);
  }, [onToggle, range.value]);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={`price-${range.id}`}
        checked={isChecked}
        onCheckedChange={handleChange}
      />
      <label 
        htmlFor={`price-${range.id}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
      >
        {range.icon && <span>{range.icon}</span>}
        {range.display_text}
      </label>
    </div>
  );
});

PriceFilterOption.displayName = 'PriceFilterOption';

function PriceFilter({ selectedPriceRanges, onPriceRangeChange }: PriceFilterProps) {
  const { priceRanges, loading, error } = usePriceRanges();

  const handlePriceToggle = useCallback((priceValue: string) => {
    const newSelected = selectedPriceRanges.includes(priceValue)
      ? selectedPriceRanges.filter(value => value !== priceValue)
      : [...selectedPriceRanges, priceValue];
    onPriceRangeChange(newSelected);
  }, [selectedPriceRanges, onPriceRangeChange]);

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
        <PriceFilterOption
          key={range.id}
          range={range}
          isChecked={selectedPriceRanges.includes(range.value)}
          onToggle={handlePriceToggle}
        />
      ))}
    </div>
  );
}

export default memo(PriceFilter);
