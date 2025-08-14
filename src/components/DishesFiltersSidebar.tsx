
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDistanceRanges } from '@/hooks/useDistanceRanges';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { useDietTypes } from '@/hooks/useDietTypes';

interface DishesFiltersSidebarProps {
  selectedDistances: number[];
  onDistanceChange: (distances: number[]) => void;
  selectedPriceRanges: string[];
  onPriceRangeChange: (priceRanges: string[]) => void;
  selectedDietTypes: string[];
  onDietTypeChange: (dietTypes: string[]) => void;
  selectedSpiceLevels: number[];
  onSpiceLevelChange: (spiceLevels: number[]) => void;
  selectedPrepTimeRanges: number[];
  onPrepTimeRangeChange: (prepTimeRanges: number[]) => void;
}

const spiceLevelOptions = [
  { id: 0, label: 'Sin picante' },
  { id: 1, label: 'Suave' },
  { id: 2, label: 'Medio' },
  { id: 3, label: 'Picante' }
];

const prepTimeOptions = [
  { id: 1, label: 'Menos de 15 min' },
  { id: 2, label: '15-30 min' },
  { id: 3, label: 'Más de 30 min' }
];

export default function DishesFiltersSidebar({
  selectedDistances = [],
  onDistanceChange,
  selectedPriceRanges = [],
  onPriceRangeChange,
  selectedDietTypes = [],
  onDietTypeChange,
  selectedSpiceLevels = [],
  onSpiceLevelChange,
  selectedPrepTimeRanges = [],
  onPrepTimeRangeChange,
}: DishesFiltersSidebarProps) {
  const { distanceRanges, loading: distanceLoading } = useDistanceRanges();
  const { priceRanges, loading: priceLoading } = usePriceRanges();
  const { dietTypes, loading: dietLoading } = useDietTypes();

  const FilterSection = ({ 
    title, 
    selectedCount, 
    children, 
    loading = false 
  }: {
    title: string;
    selectedCount: number;
    children: React.ReactNode;
    loading?: boolean;
  }) => (
    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
          {selectedCount > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 font-medium">
              {selectedCount} seleccionado{selectedCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 flex-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );

  const TagButton = ({ 
    children, 
    isSelected, 
    onClick
  }: {
    children: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "h-10 px-4 text-sm font-medium transition-all duration-200 border rounded-lg flex items-center gap-2 flex-shrink-0 shadow-sm hover:shadow-md",
        isSelected 
          ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-primary/20" 
          : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400"
      )}
    >
      <span>{children}</span>
    </button>
  );

  return (
    <div className="space-y-0">
      {/* 1. Distancia */}
      <FilterSection
        title="Distancia"
        selectedCount={selectedDistances?.length || 0}
        loading={distanceLoading}
      >
        {(distanceRanges || []).map((range) => (
          <TagButton
            key={range.id}
            isSelected={selectedDistances?.includes(range.id) || false}
            onClick={() => {
              const isSelected = selectedDistances?.includes(range.id);
              if (isSelected) {
                onDistanceChange(selectedDistances.filter(id => id !== range.id));
              } else {
                onDistanceChange([...selectedDistances, range.id]);
              }
            }}
          >
            {range.display_text}
          </TagButton>
        ))}
      </FilterSection>

      {/* 2. Presupuesto */}
      <FilterSection
        title="Presupuesto"
        selectedCount={selectedPriceRanges?.length || 0}
        loading={priceLoading}
      >
        {(priceRanges || []).map((range) => (
          <TagButton
            key={range.id}
            isSelected={selectedPriceRanges?.includes(range.value) || false}
            onClick={() => {
              const isSelected = selectedPriceRanges?.includes(range.value);
              if (isSelected) {
                onPriceRangeChange(selectedPriceRanges.filter(p => p !== range.value));
              } else {
                onPriceRangeChange([...selectedPriceRanges, range.value]);
              }
            }}
          >
            {range.display_text}
          </TagButton>
        ))}
      </FilterSection>

      {/* 3. Tipos de Dieta */}
      <FilterSection
        title="Tipos de Dieta"
        selectedCount={selectedDietTypes?.length || 0}
        loading={dietLoading}
      >
        {(dietTypes || []).map((diet) => {
          // Map diet type slugs to match database columns
          const getDietSlug = (slug: string) => {
            if (slug === 'dairy-free') return 'lactose-free';
            return slug;
          };
          
          return (
            <TagButton
              key={diet.id}
              isSelected={selectedDietTypes?.includes(getDietSlug(diet.slug)) || false}
              onClick={() => {
                const mappedSlug = getDietSlug(diet.slug);
                const isSelected = selectedDietTypes?.includes(mappedSlug);
                if (isSelected) {
                  onDietTypeChange(selectedDietTypes.filter(d => d !== mappedSlug));
                } else {
                  onDietTypeChange([...selectedDietTypes, mappedSlug]);
                }
              }}
            >
              {diet.name}
            </TagButton>
          );
        })}
      </FilterSection>

      {/* 4. Nivel de Picante */}
      <FilterSection
        title="Nivel de Picante"
        selectedCount={selectedSpiceLevels?.length || 0}
      >
        {spiceLevelOptions.map((option) => (
          <TagButton
            key={option.id}
            isSelected={selectedSpiceLevels?.includes(option.id) || false}
            onClick={() => {
              const isSelected = selectedSpiceLevels?.includes(option.id);
              if (isSelected) {
                onSpiceLevelChange(selectedSpiceLevels.filter(id => id !== option.id));
              } else {
                onSpiceLevelChange([...selectedSpiceLevels, option.id]);
              }
            }}
          >
            {option.label}
          </TagButton>
        ))}
      </FilterSection>

      {/* 5. Tiempo de Preparación */}
      <FilterSection
        title="Tiempo de Preparación"
        selectedCount={selectedPrepTimeRanges?.length || 0}
      >
        {prepTimeOptions.map((option) => (
          <TagButton
            key={option.id}
            isSelected={selectedPrepTimeRanges?.includes(option.id) || false}
            onClick={() => {
              const isSelected = selectedPrepTimeRanges?.includes(option.id);
              if (isSelected) {
                onPrepTimeRangeChange(selectedPrepTimeRanges.filter(id => id !== option.id));
              } else {
                onPrepTimeRangeChange([...selectedPrepTimeRanges, option.id]);
              }
            }}
          >
            {option.label}
          </TagButton>
        ))}
      </FilterSection>
    </div>
  );
}
