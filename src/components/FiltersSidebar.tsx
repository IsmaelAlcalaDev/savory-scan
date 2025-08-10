import { useState } from 'react';
import { ChevronDown, MapPin, Star, UtensilsCrossed, Building, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDistanceRanges } from '@/hooks/useDistanceRanges';
import { useRatingOptions } from '@/hooks/useRatingOptions';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { useServices } from '@/hooks/useServices';

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
}

const priceRangeOptions = [
  { id: 'budget', label: 'Económico', value: 'budget' },
  { id: 'moderate', label: 'Moderado', value: 'moderate' },
  { id: 'expensive', label: 'Caro', value: 'expensive' },
  { id: 'luxury', label: 'Lujo', value: 'luxury' },
];

export default function FiltersSidebar({
  selectedDistances,
  onDistanceChange,
  selectedRatings,
  onRatingChange,
  selectedEstablishments,
  onEstablishmentChange,
  selectedServices,
  onServiceChange,
  selectedPriceRanges,
  onPriceRangeChange,
}: FiltersSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    distance: true,
    rating: false,
    establishment: false,
    services: false,
    price: false,
  });

  const { distanceRanges, loading: distanceLoading } = useDistanceRanges();
  const { ratingOptions, loading: ratingLoading } = useRatingOptions();
  const { establishmentTypes, loading: establishmentLoading } = useEstablishmentTypes();
  const { services, loading: servicesLoading } = useServices();

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDistanceToggle = (distanceId: number) => {
    const newSelected = selectedDistances.includes(distanceId)
      ? selectedDistances.filter(id => id !== distanceId)
      : [...selectedDistances, distanceId];
    onDistanceChange(newSelected);
  };

  const handleRatingToggle = (ratingId: number) => {
    const newSelected = selectedRatings.includes(ratingId)
      ? selectedRatings.filter(id => id !== ratingId)
      : [...selectedRatings, ratingId];
    onRatingChange(newSelected);
  };

  const handleEstablishmentToggle = (establishmentId: number) => {
    const newSelected = selectedEstablishments.includes(establishmentId)
      ? selectedEstablishments.filter(id => id !== establishmentId)
      : [...selectedEstablishments, establishmentId];
    onEstablishmentChange(newSelected);
  };

  const handleServiceToggle = (serviceId: number) => {
    const newSelected = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    onServiceChange(newSelected);
  };

  const handlePriceRangeToggle = (priceRange: string) => {
    const newSelected = selectedPriceRanges.includes(priceRange)
      ? selectedPriceRanges.filter(range => range !== priceRange)
      : [...selectedPriceRanges, priceRange];
    onPriceRangeChange(newSelected);
  };

  const clearAllFilters = () => {
    onDistanceChange([]);
    onRatingChange([]);
    onEstablishmentChange([]);
    onServiceChange([]);
    onPriceRangeChange([]);
  };

  const hasActiveFilters = selectedDistances.length > 0 || selectedRatings.length > 0 || 
    selectedEstablishments.length > 0 || selectedServices.length > 0 || selectedPriceRanges.length > 0;

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

  const CheckboxOption = ({ 
    id, 
    checked, 
    onChange, 
    children, 
    icon 
  }: {
    id: string;
    checked: boolean;
    onChange: () => void;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div className="flex items-center space-x-3 group py-1">
      <Checkbox 
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
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

      {/* Distancia */}
      <FilterSection
        title="Distancia"
        icon={MapPin}
        sectionKey="distance"
        selectedCount={selectedDistances.length}
        loading={distanceLoading}
      >
        {distanceRanges.map((range) => (
          <CheckboxOption
            key={range.id}
            id={`distance-${range.id}`}
            checked={selectedDistances.includes(range.id)}
            onChange={() => handleDistanceToggle(range.id)}
          >
            {range.name}
          </CheckboxOption>
        ))}
      </FilterSection>

      {/* Rango de Precios */}
      <FilterSection
        title="Rango de Precios"
        icon={DollarSign}
        sectionKey="price"
        selectedCount={selectedPriceRanges.length}
      >
        {priceRangeOptions.map((option) => (
          <CheckboxOption
            key={option.id}
            id={`price-${option.id}`}
            checked={selectedPriceRanges.includes(option.value)}
            onChange={() => handlePriceRangeToggle(option.value)}
          >
            {option.label}
          </CheckboxOption>
        ))}
      </FilterSection>

      {/* Valoración */}
      <FilterSection
        title="Valoración"
        icon={Star}
        sectionKey="rating"
        selectedCount={selectedRatings.length}
        loading={ratingLoading}
      >
        {ratingOptions.map((option) => (
          <CheckboxOption
            key={option.id}
            id={`rating-${option.id}`}
            checked={selectedRatings.includes(option.id)}
            onChange={() => handleRatingToggle(option.id)}
            icon={<Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
          >
            {option.display_text}
          </CheckboxOption>
        ))}
      </FilterSection>

      {/* Tipo de Local */}
      <FilterSection
        title="Tipo de Local"
        icon={Building}
        sectionKey="establishment"
        selectedCount={selectedEstablishments.length}
        loading={establishmentLoading}
      >
        {establishmentTypes.map((type) => (
          <CheckboxOption
            key={type.id}
            id={`establishment-${type.id}`}
            checked={selectedEstablishments.includes(type.id)}
            onChange={() => handleEstablishmentToggle(type.id)}
            icon={type.icon && (
              <span className="text-sm" role="img" aria-label={type.name}>
                {type.icon}
              </span>
            )}
          >
            {type.name}
          </CheckboxOption>
        ))}
      </FilterSection>

      {/* Servicios */}
      <FilterSection
        title="Servicios"
        icon={UtensilsCrossed}
        sectionKey="services"
        selectedCount={selectedServices.length}
        loading={servicesLoading}
      >
        {services.map((service) => (
          <CheckboxOption
            key={service.id}
            id={`service-${service.id}`}
            checked={selectedServices.includes(service.id)}
            onChange={() => handleServiceToggle(service.id)}
          >
            {service.name}
          </CheckboxOption>
        ))}
      </FilterSection>
    </div>
  );
}
