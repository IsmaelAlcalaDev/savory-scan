
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useFoodTypes } from '@/hooks/useFoodTypes';

interface FoodTypeFilterProps {
  selectedFoodTypes: number[];
  onFoodTypeChange: (foodTypeIds: number[]) => void;
}

export default function FoodTypeFilter({ selectedFoodTypes, onFoodTypeChange }: FoodTypeFilterProps) {
  const { foodTypes, loading } = useFoodTypes();
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width >= 1536) { // 2xl
        setVisibleCount(12);
      } else if (width >= 1280) { // xl
        setVisibleCount(10);
      } else if (width >= 1024) { // lg
        setVisibleCount(8);
      } else if (width >= 768) { // md
        setVisibleCount(6);
      } else {
        setVisibleCount(4);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const handleFoodTypeClick = (foodTypeId: number) => {
    const newSelected = selectedFoodTypes.includes(foodTypeId)
      ? selectedFoodTypes.filter(id => id !== foodTypeId)
      : [...selectedFoodTypes, foodTypeId];
    
    onFoodTypeChange(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-20 h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!foodTypes || foodTypes.length === 0) {
    return null;
  }

  const displayedFoodTypes = foodTypes.slice(0, visibleCount);

  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
      {displayedFoodTypes.map((foodType) => {
        const isSelected = selectedFoodTypes.includes(foodType.id);
        
        return (
          <button
            key={foodType.id}
            onClick={() => handleFoodTypeClick(foodType.id)}
            className={cn(
              "flex-shrink-0 w-20 h-16 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1 p-2",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-muted-foreground hover:shadow-sm"
            )}
          >
            {foodType.icon_emoji ? (
              <span className="text-lg">{foodType.icon_emoji}</span>
            ) : (
              <div className="w-6 h-6 bg-muted rounded" />
            )}
            <span className={cn(
              "text-xs font-medium text-center leading-tight",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}>
              {foodType.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
