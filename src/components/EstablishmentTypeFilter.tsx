
import { Checkbox } from '@/components/ui/checkbox';
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
  const { establishmentTypes, loading, error } = useEstablishmentTypes();

  const handleTypeToggle = (typeId: number) => {
    const newSelected = selectedEstablishmentTypes.includes(typeId)
      ? selectedEstablishmentTypes.filter(id => id !== typeId)
      : [...selectedEstablishmentTypes, typeId];
    onEstablishmentTypeChange(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-2">
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
  );
}
