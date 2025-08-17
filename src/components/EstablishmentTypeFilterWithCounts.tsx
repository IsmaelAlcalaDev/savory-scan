
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacetCounts } from '@/hooks/useFacetCounts';

interface EstablishmentTypeFilterWithCountsProps {
  selectedEstablishmentTypes: number[];
  onEstablishmentTypeChange: (types: number[]) => void;
  cityId?: number;
  userLat?: number;
  userLng?: number;
}

export default function EstablishmentTypeFilterWithCounts({ 
  selectedEstablishmentTypes, 
  onEstablishmentTypeChange,
  cityId,
  userLat,
  userLng
}: EstablishmentTypeFilterWithCountsProps) {
  const { facetData, loading, error } = useFacetCounts({ cityId, userLat, userLng });

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
    console.error('Error loading establishment type facets:', error);
    return null;
  }

  const establishmentTypes = facetData?.establishment_types || [];

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
            <span>{type.name}</span>
            {type.count > 0 && (
              <span className="text-xs text-muted-foreground">
                ({type.count})
              </span>
            )}
          </label>
        </div>
      ))}
    </div>
  );
}
