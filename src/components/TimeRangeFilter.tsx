
import { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [isOpen, setIsOpen] = useState(true);
  const { timeRanges, loading, error } = useTimeRanges();

  const handleTimeRangeToggle = (rangeId: number) => {
    const newSelected = selectedTimeRanges.includes(rangeId)
      ? selectedTimeRanges.filter(id => id !== rangeId)
      : [...selectedTimeRanges, rangeId];
    onTimeRangeChange(newSelected);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading time ranges:', error);
    return null;
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horarios
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
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
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <span>🟢</span>
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
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
