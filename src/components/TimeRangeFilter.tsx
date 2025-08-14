
import { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTimeRanges } from '@/hooks/useTimeRanges';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeRangeFilterProps {
  selectedTimeRanges: number[];
  onTimeRangeChange: (timeRanges: number[]) => void;
}

export default function TimeRangeFilter({ selectedTimeRanges, onTimeRangeChange }: TimeRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { timeRanges, loading, error } = useTimeRanges();

  const handleTimeRangeToggle = (rangeId: number) => {
    const newSelected = selectedTimeRanges.includes(rangeId)
      ? selectedTimeRanges.filter(id => id !== rangeId)
      : [...selectedTimeRanges, rangeId];
    onTimeRangeChange(newSelected);
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
    console.error('Error loading time ranges:', error);
    return null;
  }

  return (
    <div className="space-y-3">
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
            <span>{range.icon}</span>
            {range.display_text}
          </label>
        </div>
      ))}
    </div>
  );
}
