
import { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PrepTimeFilterProps {
  selectedPrepTimeRanges: number[];
  onPrepTimeRangeChange: (prepTimeRanges: number[]) => void;
}

const prepTimeRanges = [
  { id: 1, label: 'Menos de 15 min', icon: '⚡' },
  { id: 2, label: '15-30 min', icon: '⏱️' },
  { id: 3, label: 'Más de 30 min', icon: '🕐' }
];

export default function PrepTimeFilter({ selectedPrepTimeRanges, onPrepTimeRangeChange }: PrepTimeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrepTimeToggle = (rangeId: number) => {
    const newSelected = selectedPrepTimeRanges.includes(rangeId)
      ? selectedPrepTimeRanges.filter(id => id !== rangeId)
      : [...selectedPrepTimeRanges, rangeId];
    onPrepTimeRangeChange(newSelected);
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tiempo de Preparación
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {prepTimeRanges.map((range) => (
                <div key={range.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`prep-time-${range.id}`}
                    checked={selectedPrepTimeRanges.includes(range.id)}
                    onCheckedChange={() => handlePrepTimeToggle(range.id)}
                  />
                  <label 
                    htmlFor={`prep-time-${range.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <span>{range.icon}</span>
                    {range.label}
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
