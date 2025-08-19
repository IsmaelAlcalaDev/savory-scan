
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacetCounts } from '@/hooks/useFacetCounts';

interface PriceFilterWithCountsProps {
  selectedPriceRanges: string[];
  onPriceRangeChange: (priceRanges: string[]) => void;
  cityId?: number;
  userLat?: number;
  userLng?: number;
}

export default function PriceFilterWithCounts({ 
  selectedPriceRanges, 
  onPriceRangeChange,
  cityId,
  userLat,
  userLng
}: PriceFilterWithCountsProps) {
  const { facetData, loading, error } = useFacetCounts({ cityId, userLat, userLng });

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
    console.error('Error loading price range facets:', error);
    return null;
  }

  const priceRanges = facetData?.price_ranges || [];

  return (
    <div className="space-y-3">
      {priceRanges.map((range, index) => (
        <div key={range.value || index} className="flex items-center space-x-2">
          <Checkbox 
            id={`price-${range.value}`}
            checked={selectedPriceRanges.includes(range.value)}
            onCheckedChange={() => handlePriceToggle(range.value)}
          />
          <label 
            htmlFor={`price-${range.value}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
          >
            <span>{range.value}</span>
            {range.count > 0 && (
              <span className="text-xs text-muted-foreground">
                ({range.count})
              </span>
            )}
          </label>
        </div>
      ))}
    </div>
  );
}
