
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
  { id: 'budget', label: 'Económico ($)', value: 'budget' },
  { id: 'moderate', label: 'Moderado ($$)', value: 'moderate' },
  { id: 'expensive', label: 'Caro ($$$)', value: 'expensive' },
  { id: 'luxury', label: 'Lujo ($$$$)', value: 'luxury' },
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
    distance: false,
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

  return (
    <div className="space-y-6">
      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Distancia */}
      <div>
        <Collapsible open={openSections.distance} onOpenChange={() => toggleSection('distance')}>
          <CollapsibleTrigger asChild>
            <div className="cursor-pointer mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Distancia</span>
                  {selectedDistances.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedDistances.length}
                    </Badge>
                  )}
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  openSections.distance && "rotate-180"
                )} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pl-6">
              {distanceLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {distanceRanges.map((range) => (
                    <div key={range.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`distance-${range.id}`}
                        checked={selectedDistances.includes(range.id)}
                        onCheckedChange={() => handleDistanceToggle(range.id)}
                      />
                      <label 
                        htmlFor={`distance-${range.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {range.display_text}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Valoración */}
      <div>
        <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
          <CollapsibleTrigger asChild>
            <div className="cursor-pointer mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span className="font-medium">Valoración</span>
                  {selectedRatings.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedRatings.length}
                    </Badge>
                  )}
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  openSections.rating && "rotate-180"
                )} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pl-6">
              {ratingLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {ratingOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`rating-${option.id}`}
                        checked={selectedRatings.includes(option.id)}
                        onCheckedChange={() => handleRatingToggle(option.id)}
                      />
                      <label 
                        htmlFor={`rating-${option.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                      >
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        {option.display_text}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Tipo de Establecimiento */}
      <div>
        <Collapsible open={openSections.establishment} onOpenChange={() => toggleSection('establishment')}>
          <CollapsibleTrigger asChild>
            <div className="cursor-pointer mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span className="font-medium">Tipo de Local</span>
                  {selectedEstablishments.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedEstablishments.length}
                    </Badge>
                  )}
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  openSections.establishment && "rotate-180"
                )} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pl-6">
              {establishmentLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {establishmentTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`establishment-${type.id}`}
                        checked={selectedEstablishments.includes(type.id)}
                        onCheckedChange={() => handleEstablishmentToggle(type.id)}
                      />
                      <label 
                        htmlFor={`establishment-${type.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                      >
                        {type.icon && (
                          <span className="text-sm" role="img" aria-label={type.name}>
                            {type.icon}
                          </span>
                        )}
                        {type.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Rango de Precios */}
      <div>
        <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
          <CollapsibleTrigger asChild>
            <div className="cursor-pointer mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Rango de Precios</span>
                  {selectedPriceRanges.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedPriceRanges.length}
                    </Badge>
                  )}
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  openSections.price && "rotate-180"
                )} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pl-6">
              <div className="space-y-3">
                {priceRangeOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`price-${option.id}`}
                      checked={selectedPriceRanges.includes(option.value)}
                      onCheckedChange={() => handlePriceRangeToggle(option.value)}
                    />
                    <label 
                      htmlFor={`price-${option.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Servicios */}
      <div>
        <Collapsible open={openSections.services} onOpenChange={() => toggleSection('services')}>
          <CollapsibleTrigger asChild>
            <div className="cursor-pointer mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  <span className="font-medium">Servicios</span>
                  {selectedServices.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedServices.length}
                    </Badge>
                  )}
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  openSections.services && "rotate-180"
                )} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pl-6">
              {servicesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`service-${service.id}`}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <label 
                        htmlFor={`service-${service.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                      >
                        {service.icon && (
                          <span className="text-sm" role="img" aria-label={service.name}>
                            {service.icon}
                          </span>
                        )}
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
