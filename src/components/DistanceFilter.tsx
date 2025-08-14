
import { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDistanceRanges } from '@/hooks/useDistanceRanges';
import { Skeleton } from '@/components/ui/skeleton';

interface DistanceFilterProps {
  selectedDistances: number[];
  onDistanceChange: (distances: number[]) => void;
}

export default function DistanceFilter({ selectedDistances, onDistanceChange }: DistanceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { distanceRanges, loading, error } = useDistanceRanges();

  const handleDistanceToggle = (distanceId: number) => {
    const newSelected = selectedDistances.includes(distanceId)
      ? selectedDistances.filter(id => id !== distanceId)
      : [...selectedDistances, distanceId];
    onDistanceChange(newSelected);
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
    console.error('Error loading distance ranges:', error);
    return null;
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Distancia
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {distanceRanges.map((range) => (
                <div key={range.id} className="flex items-center space-x-2">
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
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
