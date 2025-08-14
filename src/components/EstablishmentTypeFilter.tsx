
import { useState } from 'react';
import { ChevronDown, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface EstablishmentTypeFilterProps {
  selectedEstablishmentTypes: number[];
  onEstablishmentTypeChange: (types: number[]) => void;
}

export default function EstablishmentTypeFilter({ 
  selectedEstablishmentTypes, 
  onEstablishmentTypeChange 
}: EstablishmentTypeFilterProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { establishmentTypes, loading, error } = useEstablishmentTypes();

  const handleTypeToggle = (typeId: number) => {
    const newSelected = selectedEstablishmentTypes.includes(typeId)
      ? selectedEstablishmentTypes.filter(id => id !== typeId)
      : [...selectedEstablishmentTypes, typeId];
    onEstablishmentTypeChange(newSelected);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading establishment types:', error);
    return null;
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Tipo de Comercio
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {establishmentTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`establishment-${type.id}`}
                    checked={selectedEstablishmentTypes.includes(type.id)}
                    onCheckedChange={() => handleTypeToggle(type.id)}
                  />
                  <label 
                    htmlFor={`establishment-${type.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    {type.icon && <span>{type.icon}</span>}
                    {type.name}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
