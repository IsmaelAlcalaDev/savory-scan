
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useDistanceRanges } from '@/hooks/useDistanceRanges';
import { Skeleton } from '@/components/ui/skeleton';

interface DistanceFilterProps {
  selectedDistances: number[];
  onDistanceChange: (distances: number[]) => void;
}

export default function DistanceFilter({ selectedDistances, onDistanceChange }: DistanceFilterProps) {
  const { distanceRanges, loading, error } = useDistanceRanges();

  const handleDistanceChange = (value: string) => {
    const distanceId = parseInt(value);
    onDistanceChange([distanceId]);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading distance ranges:', error);
    return null;
  }

  const selectedValue = selectedDistances.length > 0 ? selectedDistances[0].toString() : '';

  return (
    <RadioGroup value={selectedValue} onValueChange={handleDistanceChange} className="space-y-3">
      {distanceRanges.map((range) => (
        <div key={range.id} className="flex items-center space-x-3">
          <RadioGroupItem 
            value={range.id.toString()}
            id={`distance-${range.id}`}
          />
          <label 
            htmlFor={`distance-${range.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {range.display_text}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
}
