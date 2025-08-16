
import { Checkbox } from '@/components/ui/checkbox';
import { useDietTypes } from '@/hooks/useDietTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useCallback, memo, useMemo } from 'react';

interface DietFilterWithPercentagesProps {
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
}

const DietOption = memo(({ 
  diet, 
  isChecked, 
  onToggle 
}: { 
  diet: any; 
  isChecked: boolean; 
  onToggle: (id: number) => void;
}) => {
  const handleChange = useCallback(() => {
    onToggle(diet.id);
  }, [onToggle, diet.id]);

  return (
    <div className="flex items-start space-x-3">
      <Checkbox 
        id={`diet-${diet.id}`}
        checked={isChecked}
        onCheckedChange={handleChange}
        className="mt-1"
      />
      <label 
        htmlFor={`diet-${diet.id}`}
        className="text-sm font-medium leading-relaxed cursor-pointer flex items-start gap-2 flex-1"
      >
        <span>{diet.min_percentage}%-{diet.max_percentage}%</span>
      </label>
    </div>
  );
});

DietOption.displayName = 'DietOption';

const DietCategorySection = memo(({ 
  category, 
  categoryIndex, 
  totalCategories, 
  selectedDietTypes, 
  onDietToggle,
  getCategoryDescription 
}: { 
  category: any; 
  categoryIndex: number; 
  totalCategories: number; 
  selectedDietTypes: number[]; 
  onDietToggle: (id: number) => void;
  getCategoryDescription: (category: string) => string;
}) => {
  const description = useMemo(() => getCategoryDescription(category.category), [getCategoryDescription, category.category]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-base text-gray-900">{category.displayName}</h4>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-gray-400" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm max-w-48">{description}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="space-y-3 ml-2">
        {category.options.map((diet: any) => (
          <DietOption
            key={diet.id}
            diet={diet}
            isChecked={selectedDietTypes.includes(diet.id)}
            onToggle={onDietToggle}
          />
        ))}
      </div>
      {categoryIndex < totalCategories - 1 && <Separator className="mt-4" />}
    </div>
  );
});

DietCategorySection.displayName = 'DietCategorySection';

function DietFilterWithPercentages({ selectedDietTypes, onDietTypeChange }: DietFilterWithPercentagesProps) {
  const { dietCategories, loading, error } = useDietTypes();

  const handleDietToggle = useCallback((dietId: number) => {
    const newSelected = selectedDietTypes.includes(dietId)
      ? selectedDietTypes.filter(id => id !== dietId)
      : [...selectedDietTypes, dietId];
    onDietTypeChange(newSelected);
  }, [selectedDietTypes, onDietTypeChange]);

  const getCategoryDescription = useCallback((category: string) => {
    const descriptions: Record<string, string> = {
      vegetarian: 'Platos que no contienen carne ni pescado',
      vegan: 'Platos completamente libres de productos animales',
      gluten_free: 'Platos sin gluten para personas celíacas',
      healthy: 'Platos equilibrados y nutritivos'
    };
    return descriptions[category] || '';
  }, []);

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
          <DietCategorySection
            key={category.category}
            category={category}
            categoryIndex={categoryIndex}
            totalCategories={dietCategories.length}
            selectedDietTypes={selectedDietTypes}
            onDietToggle={handleDietToggle}
            getCategoryDescription={getCategoryDescription}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}

export default memo(DietFilterWithPercentages);
