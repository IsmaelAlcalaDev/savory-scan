
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useFoodTypes } from '@/hooks/useFoodTypes';

interface FoodTypeFilterProps {
  selectedFoodTypes: number[];
  onFoodTypeChange: (foodTypeIds: number[]) => void;
}

export default function FoodTypeFilter({ 
  selectedFoodTypes, 
  onFoodTypeChange 
}: FoodTypeFilterProps) {
  const { foodTypes, loading, error } = useFoodTypes();

  const handleFoodTypeClick = (foodTypeId: number) => {
    console.log('FoodTypeFilter: Food type clicked:', foodTypeId);
    
    if (selectedFoodTypes.includes(foodTypeId)) {
      onFoodTypeChange(selectedFoodTypes.filter(id => id !== foodTypeId));
    } else {
      onFoodTypeChange([...selectedFoodTypes, foodTypeId]);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('FoodTypeFilter: Error loading food types:', error);
    return null;
  }

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 pr-4">
        {foodTypes.map((foodType) => {
          const isSelected = selectedFoodTypes.includes(foodType.id);
          
          return (
            <button
              key={foodType.id}
              onClick={() => handleFoodTypeClick(foodType.id)}
              className={cn(
                "h-8 px-3 text-sm font-medium transition-all duration-200 border rounded-full flex items-center whitespace-nowrap flex-shrink-0",
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary" 
                  : "bg-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground border-border"
              )}
            >
              {foodType.icon && (
                <span className="mr-1.5 text-base leading-none">{foodType.icon}</span>
              )}
              <span>{foodType.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Fade gradient for overflow */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
