
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DistanceOption {
  id: string;
  label: string;
  distance: number;
}

const distanceOptions: DistanceOption[] = [
  { id: 'very-close', label: 'Muy cerca (500m)', distance: 0.5 },
  { id: 'walking', label: 'Caminando (1km)', distance: 1 },
  { id: 'bike', label: 'En bicicleta (2km)', distance: 2 },
  { id: 'public-transport', label: 'Transporte público (5km)', distance: 5 },
  { id: 'car', label: 'En coche (10km)', distance: 10 },
  { id: 'unlimited', label: 'Sin límite', distance: Infinity },
];

interface DistanceFilterProps {
  selectedDistances: string[];
  onDistanceChange: (distances: string[]) => void;
}

export default function DistanceFilter({ selectedDistances, onDistanceChange }: DistanceFilterProps) {
  const handleDistanceChange = (distanceId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedDistances, distanceId]
      : selectedDistances.filter(id => id !== distanceId);
    onDistanceChange(newSelection);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Distancia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {distanceOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={selectedDistances.includes(option.id)}
              onCheckedChange={(checked) => handleDistanceChange(option.id, checked as boolean)}
            />
            <label
              htmlFor={option.id}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
