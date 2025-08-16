
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DishDietFilterProps {
  selectedDietTypes: string[];
  onDietTypeChange: (types: string[]) => void;
}

export default function DishDietFilter({
  selectedDietTypes,
  onDietTypeChange
}: DishDietFilterProps) {
  const dietOptions = [
    { id: 'vegetarian', name: 'Vegetariano', field: 'is_vegetarian' },
    { id: 'vegan', name: 'Vegano', field: 'is_vegan' },
    { id: 'gluten_free', name: 'Sin Gluten', field: 'is_gluten_free' },
    { id: 'healthy', name: 'Saludable', field: 'is_healthy' }
  ];

  const handleDietToggle = (dietId: string, checked: boolean) => {
    if (checked) {
      onDietTypeChange([...selectedDietTypes, dietId]);
    } else {
      onDietTypeChange(selectedDietTypes.filter(id => id !== dietId));
    }
  };

  return (
    <div className="space-y-4">
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
  );
}
