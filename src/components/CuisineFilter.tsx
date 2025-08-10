
import { useState } from 'react';
import { ChevronDown, Utensils } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface CuisineFilterProps {
  selectedCuisines: number[];
  onCuisineChange: (cuisines: number[]) => void;
}

export default function CuisineFilter({ selectedCuisines, onCuisineChange }: CuisineFilterProps) {
  const { cuisineTypes, loading, error } = useCuisineTypes();

  const handleCuisineToggle = (cuisineId: number) => {
    const newSelected = selectedCuisines.includes(cuisineId)
      ? selectedCuisines.filter(id => id !== cuisineId)
      : [...selectedCuisines, cuisineId];
    onCuisineChange(newSelected);
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="h-4 w-4" />
          <span className="font-medium">Tipos de Cocina</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center p-3 border rounded-lg">
              <Skeleton className="h-6 w-6 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading cuisine types:', error);
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Utensils className="h-4 w-4" />
        <span className="font-medium">Tipos de Cocina</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cuisineTypes.map((cuisine) => (
          <div key={cuisine.id} className="flex flex-col items-center">
            <div
              className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                selectedCuisines.includes(cuisine.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200'
              }`}
              onClick={() => handleCuisineToggle(cuisine.id)}
            >
              <div className="text-2xl mb-2">
                {cuisine.icon_emoji || '🍽️'}
              </div>
              <span className="text-xs text-center font-medium">
                {cuisine.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
