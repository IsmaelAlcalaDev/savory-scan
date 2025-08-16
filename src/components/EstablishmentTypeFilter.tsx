
import { Checkbox } from '@/components/ui/checkbox';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { useCallback, memo } from 'react';

interface EstablishmentTypeFilterProps {
  selectedEstablishmentTypes: number[];
  onEstablishmentTypeChange: (types: number[]) => void;
}

const EstablishmentTypeOption = memo(({ 
  type, 
  isChecked, 
  onToggle 
}: { 
  type: any; 
  isChecked: boolean; 
  onToggle: (id: number) => void;
}) => {
  const handleChange = useCallback(() => {
    onToggle(type.id);
  }, [onToggle, type.id]);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={`establishment-${type.id}`}
        checked={isChecked}
        onCheckedChange={handleChange}
      />
      <label 
        htmlFor={`establishment-${type.id}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
      >
        {type.icon && <span>{type.icon}</span>}
        {type.name}
      </label>
    </div>
  );
});

EstablishmentTypeOption.displayName = 'EstablishmentTypeOption';

function EstablishmentTypeFilter({ 
  selectedEstablishmentTypes, 
  onEstablishmentTypeChange 
}: EstablishmentTypeFilterProps) {
  const { establishmentTypes, loading, error } = useEstablishmentTypes();

  const handleTypeToggle = useCallback((typeId: number) => {
    const newSelected = selectedEstablishmentTypes.includes(typeId)
      ? selectedEstablishmentTypes.filter(id => id !== typeId)
      : [...selectedEstablishmentTypes, typeId];
    onEstablishmentTypeChange(newSelected);
  }, [selectedEstablishmentTypes, onEstablishmentTypeChange]);

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
        <EstablishmentTypeOption
          key={type.id}
          type={type}
          isChecked={selectedEstablishmentTypes.includes(type.id)}
          onToggle={handleTypeToggle}
        />
      ))}
    </div>
  );
}

export default memo(EstablishmentTypeFilter);
