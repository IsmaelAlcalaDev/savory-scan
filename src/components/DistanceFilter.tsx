
import { Checkbox } from '@/components/ui/checkbox';
import { useDistanceRanges } from '@/hooks/useDistanceRanges';
import { Skeleton } from '@/components/ui/skeleton';

interface DistanceFilterProps {
  selectedDistances: number[];
  onDistanceChange: (distances: number[]) => void;
}

export default function DistanceFilter({ selectedDistances, onDistanceChange }: DistanceFilterProps) {
  const { distanceRanges, loading, error } = useDistanceRanges();

  const handleDistanceToggle = (distanceId: number) => {
    const newSelected = selectedDistances.includes(distanceId)
      ? selectedDistances.filter(id => id !== distanceId)
      : [...selectedDistances, distanceId];
    onDistanceChange(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5 rounded" />
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

  return (
    <div className="space-y-3">
      {distanceRanges.map((range) => (
        <div key={range.id} className="flex items-center space-x-3">
          <Checkbox 
            id={`distance-${range.id}`}
            checked={selectedDistances.includes(range.id)}
            onCheckedChange={() => handleDistanceToggle(range.id)}
          />
          <label 
            htmlFor={`distance-${range.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {range.display_text}
          </label>
        </div>
      ))}
    </div>
  );
}
