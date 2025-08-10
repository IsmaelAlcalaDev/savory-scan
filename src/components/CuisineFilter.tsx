
import { Badge } from '@/components/ui/badge';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState, useEffect } from 'react';

interface CuisineFilterProps {
  selectedCuisines: number[];
  onCuisineChange: (cuisines: number[]) => void;
}

export default function CuisineFilter({ selectedCuisines, onCuisineChange }: CuisineFilterProps) {
  const { cuisineTypes, loading, error } = useCuisineTypes();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  console.log('CuisineFilter state:', { cuisineTypes, loading, error, selectedCuisines });

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
  }, [cuisineTypes]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const handleCuisineToggle = (cuisineId: number) => {
    const newSelected = selectedCuisines.includes(cuisineId)
      ? selectedCuisines.filter(id => id !== cuisineId)
      : [...selectedCuisines, cuisineId];
    console.log('Cuisine selection changed:', newSelected);
    onCuisineChange(newSelected);
  };

  if (loading) {
    return (
      <div className="relative w-full">
        <div className="flex gap-4 pb-3 px-1 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading cuisine types:', error);
    return (
      <div className="text-sm text-destructive p-2">
        Error cargando tipos de cocina: {error}
      </div>
    );
  }

  if (!cuisineTypes || cuisineTypes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2">
        No hay tipos de cocina disponibles
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Left arrow */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm shadow-sm h-8 w-8 p-0"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm shadow-sm h-8 w-8 p-0"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Fade effect on the left */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      
      {/* Fade effect on the right */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      
      <div 
        ref={scrollRef}
        className="flex gap-4 pb-3 px-1 overflow-x-auto scrollbar-hide"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none'
        }}
        onScroll={checkScrollability}
      >
        {cuisineTypes.map((cuisine) => (
          <div
            key={cuisine.id}
            className="flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 flex-shrink-0"
            onClick={() => handleCuisineToggle(cuisine.id)}
          >
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors
              ${selectedCuisines.includes(cuisine.id) 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-muted hover:bg-muted/80'
              }
            `}>
              {cuisine.icon && (
                <span role="img" aria-label={cuisine.name}>
                  {cuisine.icon}
                </span>
              )}
            </div>
            <span className={`
              text-xs font-medium text-center whitespace-nowrap transition-colors
              ${selectedCuisines.includes(cuisine.id) 
                ? 'text-primary' 
                : 'text-muted-foreground'
              }
            `}>
              {cuisine.name}
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
