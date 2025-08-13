
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useFoodTypes } from '@/hooks/useFoodTypes';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface FoodTypeFilterProps {
  selectedFoodTypes: number[];
  onFoodTypeChange: (foodTypeIds: number[]) => void;
}

export default function FoodTypeFilter({ selectedFoodTypes, onFoodTypeChange }: FoodTypeFilterProps) {
  const { foodTypes, loading, error } = useFoodTypes();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  console.log('FoodTypeFilter state:', { foodTypes, loading, error, selectedFoodTypes });

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [foodTypes]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const handleFoodTypeToggle = (foodTypeId: number) => {
    const newSelected = selectedFoodTypes.includes(foodTypeId)
      ? selectedFoodTypes.filter(id => id !== foodTypeId)
      : [...selectedFoodTypes, foodTypeId];
    console.log('Food type selection changed:', newSelected);
    onFoodTypeChange(newSelected);
  };

  if (loading) {
    return (
      <div className="relative w-full">
        <div className="flex gap-12 pb-2 px-1 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0">
              <Skeleton className="h-16 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading food types:', error);
    return (
      <div className="text-sm text-destructive p-2">
        Error cargando tipos de comida: {error}
      </div>
    );
  }

  if (!foodTypes || foodTypes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2">
        No hay tipos de comida disponibles
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Fade effect on the left - only show when can scroll left */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white via-white/60 to-transparent z-10 pointer-events-none" />
      )}
      
      {/* Fade effect on the right - only show when can scroll right */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white via-white/60 to-transparent z-10 pointer-events-none" />
      )}
      
      <div 
        ref={scrollRef}
        className="flex gap-12 pb-2 px-2 overflow-x-auto scrollbar-hide"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none'
        }}
        onScroll={checkScrollability}
      >
        {foodTypes.map((foodType) => (
          <div
            key={foodType.id}
            className="flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-110 flex-shrink-0"
            onClick={() => handleFoodTypeToggle(foodType.id)}
          >
            <div className="flex items-center justify-center text-4xl transition-all duration-200">
              {foodType.icon_emoji ? (
                <span 
                  role="img" 
                  aria-label={foodType.name}
                  className={`transition-all duration-200 ${
                    selectedFoodTypes.includes(foodType.id) 
                      ? 'filter brightness-110 drop-shadow-md' 
                      : 'filter brightness-100'
                  }`}
                >
                  {foodType.icon_emoji}
                </span>
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
              )}
            </div>
            <span className={`
              text-xs font-medium text-center whitespace-nowrap transition-colors text-black
              ${selectedFoodTypes.includes(foodType.id) 
                ? 'text-primary' 
                : 'text-black'
              }
            `}>
              {foodType.name}
            </span>
          </div>
        ))}
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
