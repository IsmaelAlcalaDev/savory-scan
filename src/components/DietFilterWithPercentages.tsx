
import { Checkbox } from '@/components/ui/checkbox';
import { useDietTypes } from '@/hooks/useDietTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useCallback } from 'react';

interface DietFilterWithPercentagesProps {
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
}

export default function DietFilterWithPercentages({ selectedDietTypes, onDietTypeChange }: DietFilterWithPercentagesProps) {
  const { dietCategories, loading, error } = useDietTypes();

  const handleDietToggle = useCallback((dietId: number, event?: React.MouseEvent) => {
    // Prevent event propagation to avoid modal closing
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const newSelected = selectedDietTypes.includes(dietId)
      ? selectedDietTypes.filter(id => id !== dietId)
      : [...selectedDietTypes, dietId];
    onDietTypeChange(newSelected);
  }, [selectedDietTypes, onDietTypeChange]);

  const handleCheckboxChange = useCallback((dietId: number) => {
    return (checked: boolean) => {
      const newSelected = checked
        ? [...selectedDietTypes, dietId]
        : selectedDietTypes.filter(id => id !== dietId);
      onDietTypeChange(newSelected);
    };
  }, [selectedDietTypes, onDietTypeChange]);

  const handleLabelClick = useCallback((dietId: number) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      handleDietToggle(dietId, event);
    };
  }, [handleDietToggle]);

  const getCategoryDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      vegetarian: 'Platos que no contienen carne ni pescado',
      vegan: 'Platos completamente libres de productos animales',
      gluten_free: 'Platos sin gluten para personas celíacas',
      healthy: 'Platos equilibrados y nutritivos'
    };
    return descriptions[category] || '';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3 ml-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center space-x-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-full max-w-48" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-4 border border-red-200 rounded-md">
        Error al cargar los filtros de dieta: {error}
      </div>
    );
  }

  if (!dietCategories || dietCategories.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4 border border-gray-200 rounded-md">
        No se encontraron filtros de dieta disponibles.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-xs text-green-700">
            💡 Los porcentajes indican la proporción de platos del menú que cumplen cada criterio
          </p>
        </div>

        {dietCategories.map((category, categoryIndex) => (
          <div key={category.category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-base text-gray-900">{category.displayName}</h4>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-48">{getCategoryDescription(category.category)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="space-y-3 ml-2">
              {category.options.map((diet) => (
                <div key={diet.id} className="flex items-start space-x-3">
                  <Checkbox 
                    id={`diet-${diet.id}`}
                    checked={selectedDietTypes.includes(diet.id)}
                    onCheckedChange={handleCheckboxChange(diet.id)}
                    className="mt-1"
                  />
                  <label 
                    htmlFor={`diet-${diet.id}`}
                    onClick={handleLabelClick(diet.id)}
                    className="text-sm font-medium leading-relaxed cursor-pointer flex items-start gap-2 flex-1 select-none"
                  >
                    <span>{diet.min_percentage}%-{diet.max_percentage}%</span>
                  </label>
                </div>
              ))}
            </div>
            {categoryIndex < dietCategories.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
