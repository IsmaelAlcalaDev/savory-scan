
import { useState } from 'react';
import { ChevronDown, Leaf } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDietTypes } from '@/hooks/useDietTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface DietTypeFilterProps {
  selectedDietTypes: string[];
  onDietTypeChange: (dietTypes: string[]) => void;
}

export default function DietTypeFilter({ selectedDietTypes, onDietTypeChange }: DietTypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { dietTypes, loading, error } = useDietTypes();

  const handleDietTypeToggle = (dietName: string) => {
    const newSelected = selectedDietTypes.includes(dietName)
      ? selectedDietTypes.filter(name => name !== dietName)
      : [...selectedDietTypes, dietName];
    onDietTypeChange(newSelected);
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
    console.error('Error loading diet types:', error);
    return null;
  }

  return (
    <div className="space-y-3">
      {dietTypes.map((diet) => (
        <div key={diet.id} className="flex items-center space-x-2">
          <Checkbox 
            id={`diet-${diet.id}`}
            checked={selectedDietTypes.includes(diet.name)}
            onCheckedChange={() => handleDietTypeToggle(diet.name)}
          />
          <label 
            htmlFor={`diet-${diet.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
          >
            <span>{diet.icon}</span>
            {diet.name}
          </label>
        </div>
      ))}
    </div>
  );
}
