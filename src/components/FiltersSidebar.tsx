
import { useState } from 'react';
import { ChevronDown, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDistanceRanges } from '@/hooks/useDistanceRanges';
import { useRatingOptions } from '@/hooks/useRatingOptions';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { useServices } from '@/hooks/useServices';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { useTimeRanges } from '@/hooks/useTimeRanges';

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
}: FiltersSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    distance: true,
    price: true,
    rating: false,
    time: false,
    establishment: false,
    services: false,
  });

  const { distanceRanges, loading: distanceLoading } = useDistanceRanges();
  const { ratingOptions, loading: ratingLoading } = useRatingOptions();
  const { establishmentTypes, loading: establishmentLoading } = useEstablishmentTypes();
  const { services, loading: servicesLoading } = useServices();
  const { priceRanges, loading: priceLoading } = usePriceRanges();
  const { timeRanges, loading: timeLoading } = useTimeRanges();

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterSection = ({ 
    title, 
    sectionKey, 
    selectedCount, 
    children, 
    loading = false 
  }: {
    title: string;
    sectionKey: string;
    selectedCount: number;
    children: React.ReactNode;
    loading?: boolean;
  }) => (
    <div className={cn("mb-4", sectionKey === 'distance' && "mb-2.5")}>
      <Collapsible 
        open={openSections[sectionKey]} 
        onOpenChange={() => toggleSection(sectionKey)}
      >
        <CollapsibleTrigger asChild>
          <div className="w-full py-1.5 hover:bg-muted/30 transition-colors cursor-pointer rounded-lg px-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-base">{title}</span>
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground font-medium">
                    {selectedCount}
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                openSections[sectionKey] && "rotate-180"
              )} />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-2 pb-1 pt-1">
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
        </CollapsibleContent>
      </Collapsible>
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
      {isSelected && <X className="ml-1 h-3 w-3 flex-shrink-0" />}
    </button>
  );

  return (
    <div className="space-y-0">
      {/* 1. Distancia - Tags acumulables */}
      <FilterSection
        title="Distancia"
        sectionKey="distance"
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

      {/* 2. Rango de Precios - Tags acumulables */}
      <FilterSection
        title="Presupuesto"
        sectionKey="price"
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

      {/* 3. Valoración - Tags acumulables */}
      <FilterSection
        title="Valoración"
        sectionKey="rating"
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

      {/* 4. Horarios - Tags acumulables */}
      <FilterSection
        title="Disponibilidad"
        sectionKey="time"
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

      {/* 5. Tipo de Local - Tags acumulables */}
      <FilterSection
        title="Tipo de Local"
        sectionKey="establishment"
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

      {/* 6. Servicios - Tags acumulables */}
      <FilterSection
        title="Servicios Especiales"
        sectionKey="services"
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
