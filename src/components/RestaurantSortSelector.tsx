
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

interface RestaurantSortSelectorProps {
  value: 'recommended' | 'distance';
  onChange: (value: 'recommended' | 'distance') => void;
  hasLocation?: boolean;
  className?: string;
}

export default function RestaurantSortSelector({ 
  value, 
  onChange, 
  hasLocation = false,
  className = "" 
}: RestaurantSortSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recommended">Recomendados</SelectItem>
          {hasLocation && (
            <SelectItem value="distance">Distancia</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
