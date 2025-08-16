
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface SpiceFilterProps {
  selectedSpiceLevels: number[];
  onSpiceLevelChange: (levels: number[]) => void;
}

export default function SpiceFilter({
  selectedSpiceLevels,
  onSpiceLevelChange
}: SpiceFilterProps) {
  const spiceOptions = [
    { id: 1, name: 'Poco picante' },
    { id: 2, name: 'Picante' },
    { id: 3, name: 'Muy picante' }
  ];

  const handleSpiceToggle = (spiceLevel: number, checked: boolean) => {
    if (checked) {
      onSpiceLevelChange([...selectedSpiceLevels, spiceLevel]);
    } else {
      onSpiceLevelChange(selectedSpiceLevels.filter(level => level !== spiceLevel));
    }
  };

  return (
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
  );
}
