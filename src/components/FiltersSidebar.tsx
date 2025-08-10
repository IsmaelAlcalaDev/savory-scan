
import { useState } from 'react';
import { ChevronDown, MapPin, Star, UtensilsCrossed, Building, DollarSign, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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

  const RadioOption = ({ 
    id, 
    value,
    checked, 
    onChange, 
    children, 
    icon 
  }: {
    id: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div className="flex items-center space-x-3 group py-1">
      <RadioGroupItem 
        value={value}
        id={id}
        className="border-2"
      />
      <label 
        htmlFor={id}
        className="text-sm text-foreground cursor-pointer flex items-center gap-2 flex-1 group-hover:text-primary transition-colors font-medium"
      >
        {icon}
        {children}
      </label>
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
        "h-8 px-3 text-xs font-medium transition-all duration-200",
        isSelected 
          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
          : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border"
      )}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
      {isSelected && <X className="ml-1.5 h-3 w-3" />}
    </Button>
  );

  const CheckboxOption = ({ 
    id, 
    checked, 
    onChange, 
    children 
  }: {
    id: string;
    checked: boolean;
    onChange: () => void;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center space-x-3 group py-1">
      <Checkbox 
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="border-2"
      />
      <label 
        htmlFor={id}
        className="text-sm text-foreground cursor-pointer flex-1 group-hover:text-primary transition-colors font-medium"
      >
        {children}
      </label>
    </div>
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

      {/* 1. Distancia - Radio (más importante, siempre visible) */}
      <FilterSection
        title="Distancia"
        icon={MapPin}
        sectionKey="distance"
        selectedCount={selectedDistances?.length || 0}
        loading={distanceLoading}
      >
        <RadioGroup 
          value={selectedDistances?.[0]?.toString() || ""} 
          onValueChange={(value) => onDistanceChange(value ? [parseInt(value)] : [])}
        >
          {(distanceRanges || []).map((range) => (
            <RadioOption
              key={range.id}
              id={`distance-${range.id}`}
              value={range.id.toString()}
              checked={selectedDistances?.includes(range.id) || false}
              onChange={(value) => onDistanceChange([parseInt(value)])}
            >
              {range.display_text}
            </RadioOption>
          ))}
        </RadioGroup>
      </FilterSection>

      {/* 2. Rango de Precios - Tags (visual y fácil) */}
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
                  onPriceRangeChange(selectedPriceRanges.filter(p => p !== range.value));
                } else {
                  onPriceRangeChange([range.value]);
                }
              }}
              icon={<span className="text-xs">💰</span>}
            >
              {range.display_text}
            </TagButton>
          ))}
        </div>
      </FilterSection>

      {/* 3. Valoración - Tags con estrellas (visual atractivo) */}
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
                  onRatingChange(selectedRatings.filter(r => r !== option.id));
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

      {/* 4. Horarios - Radio (práctico) */}
      <FilterSection
        title="Disponibilidad"
        icon={Clock}
        sectionKey="time"
        selectedCount={selectedTimeRanges?.length || 0}
        loading={timeLoading}
      >
        <RadioGroup 
          value={selectedTimeRanges?.[0]?.toString() || ""} 
          onValueChange={(value) => onTimeRangeChange(value ? [parseInt(value)] : [])}
        >
          {(timeRanges || []).map((range) => (
            <RadioOption
              key={range.id}
              id={`time-${range.id}`}
              value={range.id.toString()}
              checked={selectedTimeRanges?.includes(range.id) || false}
              onChange={(value) => onTimeRangeChange([parseInt(value)])}
              icon={<Clock className="h-3 w-3 text-muted-foreground" />}
            >
              {range.display_text}
            </RadioOption>
          ))}
        </RadioGroup>
      </FilterSection>

      {/* 5. Tipo de Local - Checkboxes (permite múltiples) */}
      <FilterSection
        title="Tipo de Local"
        icon={Building}
        sectionKey="establishment"
        selectedCount={selectedEstablishments?.length || 0}
        loading={establishmentLoading}
      >
        {(establishmentTypes || []).map((type) => (
          <CheckboxOption
            key={type.id}
            id={`establishment-${type.id}`}
            checked={selectedEstablishments?.includes(type.id) || false}
            onChange={() => {
              const isSelected = selectedEstablishments?.includes(type.id);
              if (isSelected) {
                onEstablishmentChange(selectedEstablishments.filter(e => e !== type.id));
              } else {
                onEstablishmentChange([...selectedEstablishments, type.id]);
              }
            }}
          >
            {type.name}
          </CheckboxOption>
        ))}
      </FilterSection>

      {/* 6. Servicios - Tags (más visual) */}
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
