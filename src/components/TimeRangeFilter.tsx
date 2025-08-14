
import { Checkbox } from '@/components/ui/checkbox';
import { useTimeRanges } from '@/hooks/useTimeRanges';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeRangeFilterProps {
  selectedTimeRanges: number[];
  onTimeRangeChange: (ranges: number[]) => void;
  isOpenNow: boolean;
  onOpenNowChange: (isOpen: boolean) => void;
}

export default function TimeRangeFilter({ 
  selectedTimeRanges, 
  onTimeRangeChange,
  isOpenNow,
  onOpenNowChange
}: TimeRangeFilterProps) {
  const { timeRanges, loading, error } = useTimeRanges();

  const handleTimeRangeToggle = (rangeId: number) => {
    const newSelected = selectedTimeRanges.includes(rangeId)
      ? selectedTimeRanges.filter(id => id !== rangeId)
      : [...selectedTimeRanges, rangeId];
    onTimeRangeChange(newSelected);
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
    console.error('Error loading time ranges:', error);
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Open Now Option */}
      <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-md">
        <Checkbox 
          id="open-now"
          checked={isOpenNow}
          onCheckedChange={onOpenNowChange}
        />
        <label 
          htmlFor="open-now"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Abierto ahora
        </label>
      </div>

      {/* Time Range Options */}
      {timeRanges.map((range) => (
        <div key={range.id} className="flex items-center space-x-2">
          <Checkbox 
            id={`time-${range.id}`}
            checked={selectedTimeRanges.includes(range.id)}
            onCheckedChange={() => handleTimeRangeToggle(range.id)}
          />
          <label 
            htmlFor={`time-${range.id}`}
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
