
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useDietTypes } from '@/hooks/useDietTypes';

interface RestaurantDietFilterProps {
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
}

export default function RestaurantDietFilter({
  selectedDietTypes,
  onDietTypeChange
}: RestaurantDietFilterProps) {
  const { dietCategories, loading } = useDietTypes();

  const handleDietToggle = (dietTypeId: number, checked: boolean) => {
    if (checked) {
      onDietTypeChange([...selectedDietTypes, dietTypeId]);
    } else {
      onDietTypeChange(selectedDietTypes.filter(id => id !== dietTypeId));
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando opciones de dieta...</div>;
  }

  if (!dietCategories || dietCategories.length === 0) {
    return <div className="text-sm text-muted-foreground">No hay tipos de dieta disponibles</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Muestra restaurantes con al menos 20% de platos de estas dietas:
      </div>
      
      {dietCategories.map((category) => (
        <div key={category.category} className="space-y-3">
          <h4 className="font-medium text-sm text-foreground border-b pb-2">
            {category.displayName}
          </h4>
          <div className="grid gap-3 pl-2">
            {category.options.map((dietType) => (
              <div key={dietType.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`restaurant-diet-${dietType.id}`}
                  checked={selectedDietTypes.includes(dietType.id)}
                  onCheckedChange={(checked) => handleDietToggle(dietType.id, checked as boolean)}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <Label 
                  htmlFor={`restaurant-diet-${dietType.id}`}
                  className="flex-1 text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                >
                  {dietType.icon && <span className="text-base">{dietType.icon}</span>}
                  {dietType.name}
                  <span className="text-xs text-muted-foreground">
                    ({dietType.min_percentage}%+ de platos)
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
