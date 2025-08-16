
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DishDietFilterProps {
  selectedDietTypes: string[];
  selectedSpiceLevels?: number[];
  onDietTypeChange: (types: string[]) => void;
  onSpiceLevelChange?: (levels: number[]) => void;
}

export default function DishDietFilter({
  selectedDietTypes,
  selectedSpiceLevels = [],
  onDietTypeChange,
  onSpiceLevelChange = () => {}
}: DishDietFilterProps) {
  const dietOptions = [
    { id: 'vegetarian', name: 'Vegetariano', field: 'is_vegetarian' },
    { id: 'vegan', name: 'Vegano', field: 'is_vegan' },
    { id: 'gluten_free', name: 'Sin Gluten', field: 'is_gluten_free' },
    { id: 'healthy', name: 'Saludable', field: 'is_healthy' }
  ];

  const spiceOptions = [
    { id: 1, name: 'Poco picante' },
    { id: 2, name: 'Picante' },
    { id: 3, name: 'Muy picante' }
  ];

  const handleDietToggle = (dietId: string, checked: boolean) => {
    if (checked) {
      onDietTypeChange([...selectedDietTypes, dietId]);
    } else {
      onDietTypeChange(selectedDietTypes.filter(id => id !== dietId));
    }
  };

  const handleSpiceToggle = (spiceLevel: number, checked: boolean) => {
    if (checked) {
      onSpiceLevelChange([...selectedSpiceLevels, spiceLevel]);
    } else {
      onSpiceLevelChange(selectedSpiceLevels.filter(level => level !== spiceLevel));
    }
  };

  return (
    <div className="space-y-6">
      {/* Diet Types Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Tipo de dieta</h4>
        <div className="grid gap-3">
          {dietOptions.map((diet) => (
            <div key={diet.id} className="flex items-center space-x-3">
              <Checkbox
                id={`dish-diet-${diet.id}`}
                checked={selectedDietTypes.includes(diet.id)}
                onCheckedChange={(checked) => handleDietToggle(diet.id, checked as boolean)}
                className="data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <Label 
                htmlFor={`dish-diet-${diet.id}`}
                className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {diet.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Spice Level Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Nivel de picante</h4>
        
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-xs">
            Este filtro puede no mostrar todos los platos con picante, ya que algunos restaurantes no especifican el nivel de picante.
          </AlertDescription>
        </Alert>

        <div className="grid gap-3">
          {spiceOptions.map((spice) => (
            <div key={spice.id} className="flex items-center space-x-3">
              <Checkbox
                id={`spice-level-${spice.id}`}
                checked={selectedSpiceLevels.includes(spice.id)}
                onCheckedChange={(checked) => handleSpiceToggle(spice.id, checked as boolean)}
                className="data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <Label 
                htmlFor={`spice-level-${spice.id}`}
                className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {spice.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
