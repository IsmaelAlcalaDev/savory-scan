
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSortOptions } from '@/hooks/useSortOptions';
import { Skeleton } from '@/components/ui/skeleton';

interface SortFilterProps {
  selectedSort?: string;
  onSortChange: (sort: string) => void;
}

export default function SortFilter({ selectedSort, onSortChange }: SortFilterProps) {
  const { sortOptions, loading, error } = useSortOptions();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading sort options:', error);
    return null;
  }

  return (
    <RadioGroup value={selectedSort} onValueChange={onSortChange}>
      <div className="space-y-3">
        {sortOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`sort-${option.id}`} />
            <Label 
              htmlFor={`sort-${option.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
            >
              {option.icon && <span>{option.icon}</span>}
              {option.display_text}
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}
