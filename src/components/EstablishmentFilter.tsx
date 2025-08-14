
import { useState } from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface EstablishmentFilterProps {
  selectedEstablishments: number[];
  onEstablishmentChange: (establishments: number[]) => void;
}

export default function EstablishmentFilter({ selectedEstablishments, onEstablishmentChange }: EstablishmentFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { establishmentTypes, loading, error } = useEstablishmentTypes();

  const handleEstablishmentToggle = (establishmentId: number) => {
    const newSelected = selectedEstablishments.includes(establishmentId)
      ? selectedEstablishments.filter(id => id !== establishmentId)
      : [...selectedEstablishments, establishmentId];
    onEstablishmentChange(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading establishment types:', error);
    return null;
  }

  return (
    <div className="space-y-3">
      {establishmentTypes.map((establishment) => (
        <div key={establishment.id} className="flex items-center space-x-2">
          <Checkbox 
            id={`establishment-${establishment.id}`}
            checked={selectedEstablishments.includes(establishment.id)}
            onCheckedChange={() => handleEstablishmentToggle(establishment.id)}
          />
          <label 
            htmlFor={`establishment-${establishment.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
          >
            <span>{establishment.icon}</span>
            {establishment.name}
          </label>
        </div>
      ))}
    </div>
  );
}
