
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

interface DietOption {
  id: string;
  name: string;
  icon?: string;
}

interface DishDietFilterProps {
  selectedDietTypes: string[];
  onDietTypeChange: (types: string[]) => void;
}

const dietOptions: DietOption[] = [
  { id: 'vegetarian', name: 'Vegetariano', icon: '🥬' },
  { id: 'vegan', name: 'Vegano', icon: '🌱' },
  { id: 'gluten_free', name: 'Sin Gluten', icon: '🌾' },
  { id: 'healthy', name: 'Saludable', icon: '💚' }
];

export default function DishDietFilter({ selectedDietTypes, onDietTypeChange }: DishDietFilterProps) {
  const isMobile = useIsMobile();

  const handleDietToggle = (dietId: string) => {
    const newSelected = selectedDietTypes.includes(dietId)
      ? selectedDietTypes.filter(id => id !== dietId)
      : [...selectedDietTypes, dietId];
    onDietTypeChange(newSelected);
  };

  return (
    <div className={`space-y-${isMobile ? '4' : '3'}`}>
      {dietOptions.map((diet) => (
        <div key={diet.id} className={`flex items-center ${isMobile ? 'space-x-4 py-2' : 'space-x-2'}`}>
          <Checkbox 
            id={`diet-${diet.id}`}
            checked={selectedDietTypes.includes(diet.id)}
            onCheckedChange={() => handleDietToggle(diet.id)}
            className={isMobile ? 'w-6 h-6' : ''}
          />
          <label 
            htmlFor={`diet-${diet.id}`}
            className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2 ${
              isMobile ? 'text-base min-h-[44px] flex-1' : 'text-sm'
            }`}
          >
            {diet.icon && <span className={isMobile ? 'text-lg' : ''}>{diet.icon}</span>}
            {diet.name}
          </label>
        </div>
      ))}
    </div>
  );
}
