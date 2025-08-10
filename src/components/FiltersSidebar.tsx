
import { useState } from 'react';
import { ChevronDown, MapPin, Star, UtensilsCrossed, Building, DollarSign, X } from 'lucide-react';
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

  const clearAllFilters = () => {
    onDistanceChange([]);
    onRatingChange([]);
    onEstablishmentChange([]);
    onServiceChange([]);
    onPriceRangeChange([]);
    onTimeRangeChange([]);
  };

  const hasActiveFilters = (selectedDistances?.length || 0) > 0 || 
    (selectedRatings?.length || 0) > 0 || 
    (selectedEstablishments?.length || 0) > 0 || 
    (selectedServices?.length || 0) > 0 || 
    (selectedPriceRanges?.length || 0) > 0 || 
    (selectedTimeRanges?.length || 0) > 0;

  const FilterSection = ({ 
    title, 
    icon: Icon, 
    sectionKey, 
    selectedCount, 
    children, 
    loading = false 
  }: {
    title: string;
    icon: any;
    sectionKey: string;
    selectedCount: number;
    children: React.ReactNode;
    loading?: boolean;
  }) => (
    <div className="mb-6">
      <Collapsible 
        open={openSections[sectionKey]} 
        onOpenChange={() => toggleSection(sectionKey)}
      >
        <CollapsibleTrigger asChild>
          <div className="w-full py-3 hover:bg-muted/30 transition-colors cursor-pointer rounded-lg px-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground text-base">{title}</span>
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary text-primary-foreground font-medium">
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
          <div className="px-3 pb-2 pt-2">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 ml-6">
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
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 px-3 text-xs font-medium transition-all duration-200 border rounded-full",
        isSelected 
          ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary" 
          : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border"
      )}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
      {isSelected && <X className="ml-1.5 h-3 w-3" />}
    </Button>
  );

  return (
    <div className="space-y-0">
      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground border-dashed hover:border-solid"
          >
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* 1. Distancia - Tags */}
      <FilterSection
        title="Distancia"
        icon={MapPin}
        sectionKey="distance"
        selectedCount={selectedDistances?.length || 0}
        loading={distanceLoading}
      >
        <div className="flex flex-wrap gap-2">
          {(distanceRanges || []).map((range) => (
            <TagButton
              key={range.id}
              isSelected={selectedDistances?.includes(range.id) || false}
              onClick={() => {
                const isSelected = selectedDistances?.includes(range.id);
                if (isSelected) {
                  onDistanceChange([]);
                } else {
                  onDistanceChange([range.id]);
                }
              }}
            >
              {range.display_text}
            </TagButton>
          ))}
        </div>
      </FilterSection>

      {/* 2. Rango de Precios - Tags sin € */}
      <FilterSection
        title="Presupuesto"
        icon={DollarSign}
        sectionKey="price"
        selectedCount={selectedPriceRanges?.length || 0}
        loading={priceLoading}
      >
        <div className="flex flex-wrap gap-2">
          {(priceRanges || []).map((range) => (
            <TagButton
              key={range.id}
              isSelected={selectedPriceRanges?.includes(range.value) || false}
              onClick={() => {
                const isSelected = selectedPriceRanges?.includes(range.value);
                if (isSelected) {
                  onPriceRangeChange([]);
                } else {
                  onPriceRangeChange([range.value]);
                }
              }}
            >
              {range.display_text}
            </TagButton>
          ))}
        </div>
      </FilterSection>

      {/* 3. Valoración - Tags con estrellas */}
      <FilterSection
        title="Valoración"
        icon={Star}
        sectionKey="rating"
        selectedCount={selectedRatings?.length || 0}
        loading={ratingLoading}
      >
        <div className="flex flex-wrap gap-2">
          {(ratingOptions || []).map((option) => (
            <TagButton
              key={option.id}
              isSelected={selectedRatings?.includes(option.id) || false}
              onClick={() => {
                const isSelected = selectedRatings?.includes(option.id);
                if (isSelected) {
                  onRatingChange([]);
                } else {
                  onRatingChange([option.id]);
                }
              }}
              icon={<Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
            >
              {option.display_text}
            </TagButton>
          ))}
        </div>
      </FilterSection>

      {/* 4. Horarios - Tags sin icono */}
      <FilterSection
        title="Disponibilidad"
        icon={DollarSign}
        sectionKey="time"
        selectedCount={selectedTimeRanges?.length || 0}
        loading={timeLoading}
      >
        <div className="flex flex-wrap gap-2">
          {(timeRanges || []).map((range) => (
            <TagButton
              key={range.id}
              isSelected={selectedTimeRanges?.includes(range.id) || false}
              onClick={() => {
                const isSelected = selectedTimeRanges?.includes(range.id);
                if (isSelected) {
                  onTimeRangeChange([]);
                } else {
                  onTimeRangeChange([range.id]);
                }
              }}
            >
              {range.display_text}
            </TagButton>
          ))}
        </div>
      </FilterSection>

      {/* 5. Tipo de Local - Tags */}
      <FilterSection
        title="Tipo de Local"
        icon={Building}
        sectionKey="establishment"
        selectedCount={selectedEstablishments?.length || 0}
        loading={establishmentLoading}
      >
        <div className="flex flex-wrap gap-2">
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
        </div>
      </FilterSection>

      {/* 6. Servicios - Tags */}
      <FilterSection
        title="Servicios Especiales"
        icon={UtensilsCrossed}
        sectionKey="services"
        selectedCount={selectedServices?.length || 0}
        loading={servicesLoading}
      >
        <div className="flex flex-wrap gap-2">
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
        </div>
      </FilterSection>
    </div>
  );
}
