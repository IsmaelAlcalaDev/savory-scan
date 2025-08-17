
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState, useEffect } from 'react';
import { useFacetCounts } from '@/hooks/useFacetCounts';

interface CuisineFilterWithCountsProps {
  selectedCuisines: number[];
  onCuisineChange: (cuisines: number[]) => void;
  cityId?: number;
  userLat?: number;
  userLng?: number;
}

export default function CuisineFilterWithCounts({ 
  selectedCuisines, 
  onCuisineChange,
  cityId,
  userLat,
  userLng
}: CuisineFilterWithCountsProps) {
  const { facetData, loading, error } = useFacetCounts({ cityId, userLat, userLng });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, [facetData]);

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
        <div className="flex gap-2 pb-1 px-1 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
              <Skeleton className="h-16 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading cuisine facets:', error);
    return (
      <div className="text-sm text-destructive p-2">
        Error cargando tipos de cocina: {error}
      </div>
    );
  }

  const cuisines = facetData?.cuisines || [];

  if (cuisines.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2">
        No hay tipos de cocina disponibles
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Fade effect on the left - only show when can scroll left */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/60 to-transparent z-10 pointer-events-none" />
      )}
      
      {/* Fade effect on the right - only show when can scroll right */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/60 to-transparent z-10 pointer-events-none" />
      )}
      
      <div 
        ref={scrollRef}
        className="flex gap-2 pb-1 px-2 overflow-x-auto scrollbar-hide"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none'
        }}
        onScroll={checkScrollability}
      >
        {cuisines.map((cuisine) => (
          <div
            key={cuisine.id}
            className="flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 hover:scale-110 flex-shrink-0 min-w-[60px]"
            onClick={() => handleCuisineToggle(cuisine.id)}
          >
            <div className="flex items-center justify-center w-16 h-16 text-4xl transition-all duration-200">
              {cuisine.icon && (
                <span 
                  role="img" 
                  aria-label={cuisine.name}
                  className={`transition-all duration-200 ${
                    selectedCuisines.includes(cuisine.id) 
                      ? 'filter brightness-110 drop-shadow-md' 
                      : 'filter brightness-100'
                  }`}
                >
                  {cuisine.icon}
                </span>
              )}
            </div>
            <div className="text-center">
              <span 
                className={`font-medium whitespace-nowrap transition-colors text-black max-w-[60px] truncate block ${
                  selectedCuisines.includes(cuisine.id) 
                    ? 'text-primary' 
                    : 'text-black'
                }`}
                style={{ fontSize: '12px' }}
              >
                {cuisine.name}
              </span>
              {cuisine.count > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({cuisine.count})
                </span>
              )}
            </div>
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
