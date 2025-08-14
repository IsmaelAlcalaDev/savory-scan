
import { useState } from 'react';
import { ChevronDown, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDietTypes } from '@/hooks/useDietTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface DietFilterProps {
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
}

export default function DietFilter({ selectedDietTypes, onDietTypeChange }: DietFilterProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { dietTypes, loading, error } = useDietTypes();

  const handleDietToggle = (dietId: number) => {
    const newSelected = selectedDietTypes.includes(dietId)
      ? selectedDietTypes.filter(id => id !== dietId)
      : [...selectedDietTypes, dietId];
    onDietTypeChange(newSelected);
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
    console.error('Error loading diet types:', error);
    return null;
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Dieta
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {dietTypes.map((diet) => (
                <div key={diet.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`diet-${diet.id}`}
                    checked={selectedDietTypes.includes(diet.id)}
                    onCheckedChange={() => handleDietToggle(diet.id)}
                  />
                  <label 
                    htmlFor={`diet-${diet.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    {diet.icon && <span>{diet.icon}</span>}
                    {diet.name}
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
