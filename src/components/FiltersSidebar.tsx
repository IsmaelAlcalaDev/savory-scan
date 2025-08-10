
import { useState } from 'react';
import { Star, Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDistanceRanges } from '@/hooks/useDistanceRanges';
import { useRatingOptions } from '@/hooks/useRatingOptions';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { useServices } from '@/hooks/useServices';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { useTimeRanges } from '@/hooks/useTimeRanges';
import { useDietTypes } from '@/hooks/useDietTypes';

interface FiltersSidebarProps {
  selectedDistances: number[];
  onDistanceChange: (distances: number[]) => void;
  selectedRatings: number[];
  onRatingChange: (ratings: number[]) => void;
  selectedEstablishments: number[];
  onEstablishmentChange: (establishments: number[]) => void;
  selectedServices: number[];
  onServiceChange: (services: number[]) => void;
  selectedPriceRanges: string[];
  onPriceRangeChange: (priceRanges: string[]) => void;
  selectedTimeRanges: number[];
  onTimeRangeChange: (timeRanges: number[]) => void;
  selectedDietTypes: string[];
  onDietTypeChange: (dietTypes: string[]) => void;
}

export default function FiltersSidebar({
  selectedDistances = [],
  onDistanceChange,
  selectedRatings = [],
  onRatingChange,
  selectedEstablishments = [],
  onEstablishmentChange,
  selectedServices = [],
  onServiceChange,
  selectedPriceRanges = [],
  onPriceRangeChange,
  selectedTimeRanges = [],
  onTimeRangeChange,
  selectedDietTypes = [],
  onDietTypeChange,
}: FiltersSidebarProps) {
  const { distanceRanges, loading: distanceLoading } = useDistanceRanges();
  const { ratingOptions, loading: ratingLoading } = useRatingOptions();
  const { establishmentTypes, loading: establishmentLoading } = useEstablishmentTypes();
  const { services, loading: servicesLoading } = useServices();
  const { priceRanges, loading: priceLoading } = usePriceRanges();
  const { timeRanges, loading: timeLoading } = useTimeRanges();
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
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-bold text-foreground text-base">{title}</span>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground font-medium">
            {selectedCount}
          </Badge>
        )}
      </div>
      <div className="px-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 overflow-x-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );

  const TagButton = ({ 
    children, 
    isSelected, 
    onClick,
    icon
  }: {
    children: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "h-7 px-2.5 text-xs font-medium transition-all duration-200 border rounded-full !bg-transparent !shadow-none !backdrop-blur-none flex items-center flex-shrink-0",
        isSelected 
          ? "!bg-primary text-primary-foreground hover:!bg-primary/90 border-primary" 
          : "!bg-transparent hover:!bg-muted/50 text-muted-foreground hover:text-foreground border-border"
      )}
    >
      {icon && <span className="mr-1 flex items-center">{icon}</span>}
      <span className="flex items-center">{children}</span>
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

      {/* 2. Rango de Precios */}
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
        {(dietTypes || []).map((diet) => (
          <TagButton
            key={diet.id}
            isSelected={selectedDietTypes?.includes(diet.slug) || false}
            onClick={() => {
              const isSelected = selectedDietTypes?.includes(diet.slug);
              if (isSelected) {
                onDietTypeChange(selectedDietTypes.filter(d => d !== diet.slug));
              } else {
                onDietTypeChange([...selectedDietTypes, diet.slug]);
              }
            }}
            icon={<Leaf className="h-3 w-3 text-green-500" />}
          >
            {diet.name}
          </TagButton>
        ))}
      </FilterSection>

      {/* 4. Valoración */}
      <FilterSection
        title="Valoración"
        selectedCount={selectedRatings?.length || 0}
        loading={ratingLoading}
      >
        {(ratingOptions || []).map((option) => (
          <TagButton
            key={option.id}
            isSelected={selectedRatings?.includes(option.id) || false}
            onClick={() => {
              const isSelected = selectedRatings?.includes(option.id);
              if (isSelected) {
                onRatingChange(selectedRatings.filter(id => id !== option.id));
              } else {
                onRatingChange([...selectedRatings, option.id]);
              }
            }}
            icon={<Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
          >
            {option.display_text}
          </TagButton>
        ))}
      </FilterSection>

      {/* 5. Horarios */}
      <FilterSection
        title="Disponibilidad"
        selectedCount={selectedTimeRanges?.length || 0}
        loading={timeLoading}
      >
        {(timeRanges || []).map((range) => (
          <TagButton
            key={range.id}
            isSelected={selectedTimeRanges?.includes(range.id) || false}
            onClick={() => {
              const isSelected = selectedTimeRanges?.includes(range.id);
              if (isSelected) {
                onTimeRangeChange(selectedTimeRanges.filter(id => id !== range.id));
              } else {
                onTimeRangeChange([...selectedTimeRanges, range.id]);
              }
            }}
          >
            {range.display_text}
          </TagButton>
        ))}
      </FilterSection>

      {/* 6. Tipo de Local */}
      <FilterSection
        title="Tipo de Local"
        selectedCount={selectedEstablishments?.length || 0}
        loading={establishmentLoading}
      >
        {(establishmentTypes || []).map((type) => (
          <TagButton
            key={type.id}
            isSelected={selectedEstablishments?.includes(type.id) || false}
            onClick={() => {
              const isSelected = selectedEstablishments?.includes(type.id);
              if (isSelected) {
                onEstablishmentChange(selectedEstablishments.filter(e => e !== type.id));
              } else {
                onEstablishmentChange([...selectedEstablishments, type.id]);
              }
            }}
          >
            {type.name}
          </TagButton>
        ))}
      </FilterSection>

      {/* 7. Servicios */}
      <FilterSection
        title="Servicios Especiales"
        selectedCount={selectedServices?.length || 0}
        loading={servicesLoading}
      >
        {(services || []).map((service) => (
          <TagButton
            key={service.id}
            isSelected={selectedServices?.includes(service.id) || false}
            onClick={() => {
              const isSelected = selectedServices?.includes(service.id);
              if (isSelected) {
                onServiceChange(selectedServices.filter(s => s !== service.id));
              } else {
                onServiceChange([...selectedServices, service.id]);
              }
            }}
          >
            {service.name}
          </TagButton>
        ))}
      </FilterSection>
    </div>
  );
}
